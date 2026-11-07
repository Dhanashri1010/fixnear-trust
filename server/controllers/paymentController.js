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
export const calculateBookingTotal = (booking) => {
  const base = booking.basePrice || 0;
  const approvedExtra = booking.quotation?.status === 'APPROVED' ? (booking.quotation.total || 0) : 0;
  const platformFee = booking.platformFeeSnapshot ?? 20;
  return base + approvedExtra + platformFee;
};

// Shared atomic helper to mark booking PAID and credit provider earnings exactly once
export const markBookingPaidHelper = async ({
  booking,
  paymentDoc,
  razorpayPaymentId,
  razorpayOrderId,
  paymentMethod = 'ONLINE',
  receiptNumber,
  req,
}) => {
  const finalAmount = calculateBookingTotal(booking);
  const invoiceNumber = receiptNumber || booking.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Atomic update: condition paymentStatus !== 'PAID' guarantees single execution
  const updatedBooking = await Booking.findOneAndUpdate(
    { _id: booking._id, paymentStatus: { $ne: 'PAID' } },
    {
      $set: {
        paymentStatus: 'PAID',
        paymentMethod,
        razorpayPaymentId: razorpayPaymentId || booking.razorpayPaymentId,
        razorpayOrderId: razorpayOrderId || booking.razorpayOrderId,
        invoiceNumber,
        'invoice.status': 'PAID',
        'invoice.paidAt': new Date(),
        'invoice.totalAmount': finalAmount,
      },
    },
    { new: true }
  );

  // If already marked PAID, return existing state without crediting earnings again
  if (!updatedBooking) {
    const existing = await Booking.findById(booking._id);
    return {
      success: true,
      alreadyPaid: true,
      booking: existing,
      invoiceNumber: existing?.invoiceNumber || invoiceNumber,
      totalAmount: finalAmount,
    };
  }

  // Update Payment record
  if (paymentDoc) {
    paymentDoc.status = 'PAID';
    if (razorpayPaymentId) paymentDoc.razorpayPaymentId = razorpayPaymentId;
    paymentDoc.receiptNumber = invoiceNumber;
    paymentDoc.paidAt = new Date();
    await paymentDoc.save();
  }

  // Credit provider earnings with snapshot commission EXACTLY ONCE
  if (updatedBooking.providerId) {
    const commissionRate = updatedBooking.commissionRateSnapshot ?? 10;
    const laborTotal = (updatedBooking.invoice?.baseAmount || updatedBooking.basePrice || 0) + (updatedBooking.quotation?.status === 'APPROVED' ? updatedBooking.quotation.total : 0);
    const commission = Math.round((laborTotal * commissionRate) / 100);
    const netPayout = laborTotal - commission;

    await Provider.findByIdAndUpdate(updatedBooking.providerId, {
      $inc: {
        jobsDone: 1,
        earningsToday: netPayout,
        earningsWeek: netPayout,
        earningsMonth: netPayout,
      },
    });

    const prov = await Provider.findById(updatedBooking.providerId);
    if (prov) {
      await notifyUser({
        userId: prov.userId,
        role: 'provider',
        title: 'Payment Received',
        message: `Customer payment of ₹${finalAmount} settled (${paymentMethod}) for booking #${updatedBooking.bookingId}. Your net payout: ₹${netPayout}.`,
        type: 'payment',
        link: '/provider/dashboard',
      });
    }
  }

  // Send receipt email to customer
  const customerEmail = req?.user?.email || (await User.findById(updatedBooking.customerId))?.email;
  if (customerEmail) {
    sendJobCompletedEmail({
      customerEmail,
      customerName: updatedBooking.customerName,
      bookingId: updatedBooking.bookingId,
      serviceTitle: updatedBooking.serviceTitle,
      totalAmount: finalAmount,
      invoiceNumber,
      paymentMethod: paymentMethod === 'ONLINE' ? 'Online (Razorpay Verified)' : 'Cash to Specialist',
    }).catch(() => {});
  }

  if (io) {
    io.to(`booking_${updatedBooking.bookingId}`).emit('payment_confirmed', {
      bookingId: updatedBooking.bookingId,
      paymentStatus: 'PAID',
      invoiceNumber,
      totalAmount: finalAmount,
    });
  }

  return {
    success: true,
    alreadyPaid: false,
    booking: updatedBooking,
    invoiceNumber,
    totalAmount: finalAmount,
  };
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

    // 1. Authenticated customer who owns the booking (or admin)
    if (String(booking.customerId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this booking.' });
    }

    // 2. Booking status must be COMPLETED
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification requires booking status to be COMPLETED.',
      });
    }

    // 3. booking.razorpayOrderId must match razorpayOrderId
    if (!booking.razorpayOrderId || booking.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment order ID does not match this booking record.',
      });
    }

    // 4. Look up Payment record by razorpayOrderId; require same booking and matching server total
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(400).json({
        success: false,
        message: 'No payment transaction record found for this order ID.',
      });
    }

    if (String(payment.bookingId) !== String(booking._id)) {
      return res.status(400).json({
        success: false,
        message: 'Payment transaction record does not belong to this booking.',
      });
    }

    const finalAmount = calculateBookingTotal(booking);
    if (payment.amount !== finalAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment record amount (₹${payment.amount}) does not match current server-calculated total (₹${finalAmount}).`,
      });
    }

    // 5. Compare signatures with crypto.timingSafeEqual
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Payment gateway configuration missing.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(String(razorpaySignature || ''), 'utf8');

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    // 6. In production (not test), fetch payment from Razorpay and require status 'captured' and matching amount
    if (process.env.NODE_ENV === 'production') {
      const Razorpay = (await import('razorpay')).default;
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const rzpPayment = await rzp.payments.fetch(razorpayPaymentId);
      if (!rzpPayment || rzpPayment.status !== 'captured' || Number(rzpPayment.amount) !== finalAmount * 100) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Razorpay payment is not captured or amount does not match order.',
        });
      }
    }

    // 7. Atomic update & single earnings credit
    const result = await markBookingPaidHelper({
      booking,
      paymentDoc: payment,
      razorpayPaymentId,
      razorpayOrderId,
      paymentMethod: 'ONLINE',
      req,
    });

    res.status(200).json({
      success: true,
      message: result.alreadyPaid ? 'Payment has already been confirmed.' : 'Payment verified successfully! Receipt generated.',
      paymentStatus: 'PAID',
      invoiceNumber: result.invoiceNumber,
      receiptNumber: result.invoiceNumber,
      totalAmount: result.totalAmount,
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
    if (!provider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only registered technicians or administrators can confirm cash receipts.' });
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

    if (provider && String(booking.providerId) !== String(provider._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this booking.' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Service must be completed before confirming cash.' });
    }

    // 1. Only allow cash confirmation if NO online payment is INITIATED within the last 15 minutes
    const recentInitiated = await Payment.findOne({
      bookingId: booking._id,
      method: 'ONLINE',
      status: 'INITIATED',
      createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) },
    });

    if (recentInitiated) {
      return res.status(400).json({
        success: false,
        message: 'The customer started an online payment within the last 15 minutes. Please wait before confirming cash to prevent double payment.',
      });
    }

    const invoiceNumber = booking.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = calculateBookingTotal(booking);

    // 2. Atomic update on paymentStatus !== 'PAID'
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: booking._id, paymentStatus: { $ne: 'PAID' } },
      {
        $set: {
          paymentStatus: 'PAID',
          paymentMethod: 'CASH',
          invoiceNumber,
          'invoice.status': 'PAID',
          'invoice.paidAt': new Date(),
          'invoice.totalAmount': totalAmount,
        },
      },
      { new: true }
    );

    // If already marked PAID, return existing status without crediting earnings again
    if (!updatedBooking) {
      return res.status(200).json({
        success: true,
        message: 'Cash payment already verified.',
        paymentStatus: 'PAID',
        invoiceNumber: booking.invoiceNumber || invoiceNumber,
        totalAmount,
      });
    }

    // Record cash payment
    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: booking.customerId,
      providerId: booking.providerId,
      amount: totalAmount,
      currency: 'INR',
      method: 'CASH',
      status: 'PAID',
      receiptNumber: invoiceNumber,
      metadata: { confirmedBy: provider?.name || 'Administrator' },
    });

    // 3. Update provider earnings with snapshot commission EXACTLY ONCE
    const commissionRate = updatedBooking.commissionRateSnapshot ?? 10;
    const laborTotal = (updatedBooking.invoice?.baseAmount || updatedBooking.basePrice || 0) + (updatedBooking.quotation?.status === 'APPROVED' ? updatedBooking.quotation.total : 0);
    const commission = Math.round((laborTotal * commissionRate) / 100);
    const netPayout = laborTotal - commission;

    if (updatedBooking.providerId) {
      await Provider.findByIdAndUpdate(updatedBooking.providerId, {
        $inc: {
          jobsDone: 1,
          earningsToday: netPayout,
          earningsWeek: netPayout,
          earningsMonth: netPayout,
        },
      });
    }

    // 4. Notify customer when cash is confirmed so they can dispute a wrong confirmation
    await notifyUser({
      userId: booking.customerId,
      role: 'customer',
      title: 'Cash Payment Recorded by Specialist',
      message: `Technician confirmed cash payment of ₹${totalAmount} for booking #${booking.bookingId} (Invoice #${invoiceNumber}). If you did not make this cash payment, please report this immediately from your tracking screen.`,
      type: 'payment',
      link: `/track/${booking._id}`,
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
        paymentMethod: 'Cash to Specialist',
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

// POST /api/payments/webhook (Razorpay Webhook Handler with RAW body verification)
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Reject if signature header or secret is missing (return 400, no fallback to key secret)
    if (!signature || !secret) {
      return res.status(400).json({
        success: false,
        message: 'Webhook verification rejected: Missing signature header or RAZORPAY_WEBHOOK_SECRET.',
      });
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(String(signature), 'utf8');

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch (parseErr) {
      return res.status(400).json({ success: false, message: 'Invalid JSON payload in webhook body.' });
    }

    const event = payload?.event;
    if (!event) {
      return res.status(400).json({ success: false, message: 'Missing event in webhook payload.' });
    }

    // 1. payment.captured and order.paid: run shared markBookingPaidHelper
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;
      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;

      if (!orderId) {
        return res.status(400).json({ success: false, message: 'Missing order_id in webhook payload.' });
      }

      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      if (!booking) {
        return res.status(400).json({ success: false, message: 'No booking found matching webhook order ID.' });
      }

      if (booking.status !== 'COMPLETED') {
        return res.status(400).json({ success: false, message: 'Booking is not completed.' });
      }

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (!payment || String(payment.bookingId) !== String(booking._id)) {
        return res.status(400).json({ success: false, message: 'Payment record not found or does not belong to booking.' });
      }

      const finalAmount = calculateBookingTotal(booking);
      if (payment.amount !== finalAmount) {
        return res.status(400).json({ success: false, message: 'Payment amount mismatch in webhook.' });
      }

      // In production, verify capture with Razorpay
      if (process.env.NODE_ENV === 'production' && paymentId) {
        const Razorpay = (await import('razorpay')).default;
        const rzp = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const rzpPayment = await rzp.payments.fetch(paymentId);
        if (!rzpPayment || rzpPayment.status !== 'captured' || Number(rzpPayment.amount) !== finalAmount * 100) {
          return res.status(400).json({
            success: false,
            message: 'Razorpay payment is not captured or amount mismatch in webhook.',
          });
        }
      }

      await markBookingPaidHelper({
        booking,
        paymentDoc: payment,
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        paymentMethod: 'ONLINE',
      });

      return res.status(200).json({ success: true, event });
    }

    // 2. refund.processed: record refund on Payment record
    if (event === 'refund.processed') {
      const refundEntity = payload.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        const payment = await Payment.findOne({ razorpayPaymentId: paymentId });
        if (payment) {
          const refundAmount = Number(refundEntity.amount) / 100;
          payment.refundId = refundEntity.id;
          payment.refundAmount = refundAmount;
          payment.status = refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
          await payment.save();
        }
      }
      return res.status(200).json({ success: true, event });
    }

    // Return 200 ONLY for valid events, 400 for unknown/unhandled events
    return res.status(400).json({ success: false, message: `Unhandled event: ${event}` });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
