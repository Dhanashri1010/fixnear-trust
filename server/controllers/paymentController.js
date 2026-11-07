import crypto from 'crypto';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { notifyUser } from './notificationController.js';
import { sendJobCompletedEmail } from '../utils/emailHelper.js';
import { io } from '../server.js';

// GET /api/payments/config
export const getPaymentConfig = (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const razorpayEnabled = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET);

  res.status(200).json({
    success: true,
    razorpayEnabled,
    keyId: razorpayEnabled ? keyId : null,
  });
};

// Helper to calculate exact bill from server state
const calculateBookingTotal = (booking) => {
  const base = booking.basePrice || 0;
  const approvedExtra = booking.quotation?.status === 'APPROVED' ? (booking.quotation.total || 0) : 0;
  const platformFee = booking.platformFeeSnapshot ?? 20;
  return base + approvedExtra + platformFee;
};

// POST /api/payments/order (Customer initiated)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({
        success: false,
        message: 'Online payment gateway is not configured. Please choose Pay in Cash.',
      });
    }

    const isObjectId = mongoose.isValidObjectId(bookingId);
    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: bookingId }] : []),
        { bookingId: String(bookingId).toUpperCase() },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (String(booking.customerId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this booking.' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be processed after service is completed.',
      });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid.',
      });
    }

    // SERVER calculates amount - never trust request body
    const finalAmount = calculateBookingTotal(booking);

    // Reuse existing initiated payment order if valid to prevent duplicate order generation
    const existingOrder = await Payment.findOne({
      bookingId: booking._id,
      amount: finalAmount,
      status: 'INITIATED',
      method: 'ONLINE',
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }, // within 30 min
    });

    if (existingOrder && existingOrder.razorpayOrderId) {
      return res.status(200).json({
        success: true,
        orderId: existingOrder.razorpayOrderId,
        amount: finalAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        bookingNumber: booking.bookingId,
        customerName: booking.customerName,
        customerEmail: req.user.email,
        customerPhone: booking.customerPhone,
      });
    }

    const receipt = `rcpt_${booking.bookingId}_${Date.now()}`;
    const orderOptions = {
      amount: Math.round(finalAmount * 100), // paise
      currency: 'INR',
      receipt,
      notes: {
        bookingId: booking.bookingId,
        customerId: String(booking.customerId),
        serviceTitle: booking.serviceTitle,
      },
    };

    let order;
    if (process.env.NODE_ENV === 'test') {
      order = {
        id: `order_mock_${booking.bookingId}_${Date.now()}`,
        amount: Math.round(finalAmount * 100),
        currency: 'INR',
        receipt,
      };
    } else {
      const Razorpay = (await import('razorpay')).default;
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      order = await rzp.orders.create(orderOptions);
    }

    booking.razorpayOrderId = order.id;
    await booking.save();

    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: booking.customerId,
      providerId: booking.providerId,
      amount: finalAmount,
      currency: 'INR',
      method: 'ONLINE',
      status: 'INITIATED',
      razorpayOrderId: order.id,
      receiptNumber: receipt,
      metadata: { order },
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: finalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingNumber: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: req.user.email,
      customerPhone: booking.customerPhone,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify (Customer verification)
export const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    const isObjectId = mongoose.isValidObjectId(bookingId);
    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: bookingId }] : []),
        { bookingId: String(bookingId).toUpperCase() },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Idempotency: Safe to repeat, no double marking
    if (booking.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been confirmed and receipt generated.',
        paymentStatus: 'PAID',
        invoiceNumber: booking.invoiceNumber || `INV-${booking.bookingId}`,
      });
    }

    // Verify cryptographic signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    const invoiceNumber = booking.invoiceNumber || `INV-${booking.bookingId}`;
    const totalAmount = calculateBookingTotal(booking);

    booking.paymentStatus = 'PAID';
    booking.paymentMethod = 'ONLINE';
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.invoiceNumber = invoiceNumber;
    if (booking.invoice) {
      booking.invoice.status = 'PAID';
      booking.invoice.paidAt = new Date();
      booking.invoice.totalAmount = totalAmount;
    }
    await booking.save();

    // Update Payment collection record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        $set: {
          status: 'PAID',
          razorpayPaymentId,
          razorpaySignature,
          receiptNumber: invoiceNumber,
        },
      },
      { upsert: true, new: true }
    );

    // Update Provider earnings with snapshot commission
    if (booking.providerId) {
      const commissionRate = booking.commissionRateSnapshot ?? 10;
      const laborTotal = (booking.invoice?.baseAmount || booking.basePrice || 0) + (booking.quotation?.status === 'APPROVED' ? booking.quotation.total : 0);
      const commission = Math.round((laborTotal * commissionRate) / 100);
      const netPayout = laborTotal - commission;

      await Provider.findByIdAndUpdate(booking.providerId, {
        $inc: {
          jobsDone: 1,
          earningsToday: netPayout,
          earningsWeek: netPayout,
          earningsMonth: netPayout,
        },
      });

      // Notify provider of payment
      const prov = await Provider.findById(booking.providerId);
      if (prov) {
        await notifyUser({
          userId: prov.userId,
          role: 'provider',
          title: 'Payment Received',
          message: `Customer paid ₹${totalAmount} online for booking #${booking.bookingId}. Your net payout: ₹${netPayout}.`,
          type: 'payment',
          link: '/provider/dashboard',
        });
      }
    }

    // Send receipt email to customer
    sendJobCompletedEmail({
      customerEmail: req.user.email,
      customerName: booking.customerName,
      bookingId: booking.bookingId,
      serviceTitle: booking.serviceTitle,
      totalAmount,
      invoiceNumber,
      paymentMethod: 'Online (Razorpay Verified)',
    }).catch(() => {});

    if (io) {
      io.to(`booking_${booking.bookingId}`).emit('payment_confirmed', {
        bookingId: booking.bookingId,
        paymentStatus: 'PAID',
        invoiceNumber,
        totalAmount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Receipt generated.',
      paymentStatus: 'PAID',
      invoiceNumber,
      receiptNumber: invoiceNumber,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/cash-confirm (Provider confirms cash received)
export const confirmCashPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(403).json({ success: false, message: 'Only registered technicians can confirm cash receipts.' });
    }

    const isObjectId = mongoose.isValidObjectId(bookingId);
    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: bookingId }] : []),
        { bookingId: String(bookingId).toUpperCase() },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (String(booking.providerId) !== String(provider._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this booking.' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Service must be completed before confirming cash.' });
    }

    const invoiceNumber = booking.invoiceNumber || `INV-${booking.bookingId}`;
    const totalAmount = calculateBookingTotal(booking);

    // Idempotency: Safe to repeat, no double marking
    if (booking.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Cash payment already verified.',
        paymentStatus: 'PAID',
        invoiceNumber,
        totalAmount,
      });
    }

    booking.paymentStatus = 'PAID';
    booking.paymentMethod = 'CASH';
    booking.invoiceNumber = invoiceNumber;
    if (booking.invoice) {
      booking.invoice.status = 'PAID';
      booking.invoice.paidAt = new Date();
      booking.invoice.totalAmount = totalAmount;
    }
    await booking.save();

    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: booking.customerId,
      providerId: provider._id,
      amount: totalAmount,
      currency: 'INR',
      method: 'CASH',
      status: 'PAID',
      receiptNumber: invoiceNumber,
      metadata: { confirmedBy: provider.name },
    });

    // Update earnings using historical snapshot
    const commissionRate = booking.commissionRateSnapshot ?? 10;
    const laborTotal = (booking.invoice?.baseAmount || booking.basePrice || 0) + (booking.quotation?.status === 'APPROVED' ? booking.quotation.total : 0);
    const commission = Math.round((laborTotal * commissionRate) / 100);
    const netPayout = laborTotal - commission;

    await Provider.findByIdAndUpdate(provider._id, {
      $inc: {
        jobsDone: 1,
        earningsToday: netPayout,
        earningsWeek: netPayout,
        earningsMonth: netPayout,
      },
    });

    // Notify customer
    await notifyUser({
      userId: booking.customerId,
      role: 'customer',
      title: 'Cash Payment Confirmed',
      message: `Technician ${provider.name} confirmed cash receipt of ₹${totalAmount}. Receipt #${invoiceNumber} is available.`,
      type: 'payment',
      link: `/bookings`,
    });

    // Send receipt email to customer
    const customer = await User.findById(booking.customerId);
    if (customer) {
      sendJobCompletedEmail({
        customerEmail: customer.email,
        customerName: booking.customerName,
        bookingId: booking.bookingId,
        serviceTitle: booking.serviceTitle,
        totalAmount,
        invoiceNumber,
        paymentMethod: 'Cash to Technician',
      }).catch(() => {});
    }

    if (io) {
      io.to(`booking_${booking.bookingId}`).emit('payment_confirmed', {
        bookingId: booking.bookingId,
        paymentStatus: 'PAID',
        invoiceNumber,
        totalAmount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cash payment confirmed and receipt issued.',
      paymentStatus: 'PAID',
      invoiceNumber,
      receiptNumber: invoiceNumber,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/webhook (Razorpay Webhook Handler)
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !secret) {
      return res.status(200).json({ received: true, note: 'Webhook skipped: unconfigured secret' });
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment && payment.status !== 'PAID') {
          payment.status = 'PAID';
          payment.razorpayPaymentId = paymentEntity.id;
          await payment.save();

          await Booking.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: 'PAID',
            paymentMethod: 'ONLINE',
            razorpayPaymentId: paymentEntity.id,
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    res.status(200).json({ received: true }); // Always 200 to prevent webhook retry storms
  }
};
