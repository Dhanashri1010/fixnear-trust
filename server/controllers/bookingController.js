import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { Provider } from '../models/Provider.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';
import { Notification } from '../models/Notification.js';
import { io } from '../server.js';

// Helper to create notifications and emit socket event
const notifyUser = async ({ userId, role, title, message, type = 'booking', link = '' }) => {
  try {
    const notification = await Notification.create({
      userId,
      role,
      title,
      message,
      type,
      link,
    });
    if (io) {
      io.to(`user_${userId}`).emit('notification', notification);
    }
    return notification;
  } catch (err) {
    console.warn('[Notification Error]:', err.message);
  }
};

// Generate unique booking number FX-xxxxx
const generateBookingId = async () => {
  let unique = false;
  let code = '';
  while (!unique) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    code = `FX-${randomDigits}`;
    const existing = await Booking.findOne({ bookingId: code });
    if (!existing) unique = true;
  }
  return code;
};

// POST /api/bookings (customer only)
export const createBooking = async (req, res, next) => {
  try {
    const { serviceId, address, city, scheduledDate, timeSlot, notes, photos } = req.body;

    // Validate scheduled date is not in the past
    const bookingDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(bookingDate.getTime()) || bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date cannot be in the past. Please select today or a future date.',
      });
    }

    // 1. Fetch real service from database (never trust price from client)
    const isObjectId = mongoose.isValidObjectId(serviceId);
    const service = await Service.findOne({
      $or: [{ serviceId }, ...(isObjectId ? [{ _id: serviceId }] : [])],
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'The requested service is not available.',
      });
    }

    const bookingCity = (city || req.user.city || 'Mumbai').trim();

    // 2. Check for an approved, online provider in this service & city
    const providerQuery = {
      status: 'approved',
      isOnline: true,
      city: new RegExp(`^${bookingCity}$`, 'i'),
    };

    if (service.categoryId) {
      providerQuery.$or = [
        { 'skills.categoryId': service.categoryId },
        { specialty: new RegExp(service.category || service.categoryId, 'i') },
      ];
    }

    let matchingProviders = await Provider.find(providerQuery).sort({ ratingAvg: -1, jobsDone: -1 });

    // Fallback if category skill is generic
    if (!matchingProviders || matchingProviders.length === 0) {
      matchingProviders = await Provider.find({
        status: 'approved',
        isOnline: true,
        city: new RegExp(`^${bookingCity}$`, 'i'),
      }).sort({ ratingAvg: -1 });
    }

    if (!matchingProviders || matchingProviders.length === 0) {
      return res.status(400).json({
        success: false,
        message: `We currently do not have a verified, online technician available in ${bookingCity} for ${service.title}. Please check back shortly or select another area.`,
      });
    }

    const assignedProvider = matchingProviders[0];

    // 3. Generate booking ID and 4-digit completion finish code
    const bookingNumber = await generateBookingId();
    const completionOtp = String(Math.floor(1000 + Math.random() * 9000));

    const initialTimeline = [
      { step: 'Booking Requested', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true, current: true },
      { step: 'Technician Assigned', time: 'Pending', done: false, current: false },
      { step: 'On The Way', time: 'Pending', done: false, current: false },
      { step: 'Service in Progress', time: 'Pending', done: false, current: false },
      { step: 'Completed', time: 'Pending', done: false, current: false },
    ];

    const newBooking = await Booking.create({
      bookingId: bookingNumber,
      customerId: req.user._id,
      customerName: req.user.name,
      customerPhone: req.user.phone || '',
      providerId: assignedProvider._id,
      providerName: assignedProvider.name,
      providerPhone: assignedProvider.phone,
      serviceId: service.serviceId,
      serviceTitle: service.title,
      basePrice: service.startingPrice, // Server-enforced price
      address,
      city: bookingCity,
      scheduledDate,
      timeSlot,
      notes: notes || '',
      photos: Array.isArray(photos) ? photos.slice(0, 3) : [],
      status: 'REQUESTED',
      completionOtp,
      timeline: initialTimeline,
      quotation: {
        items: [],
        total: 0,
        status: 'NONE',
      },
      invoice: {
        invoiceNo: `INV-${bookingNumber}`,
        status: 'UNPAID',
        baseAmount: service.startingPrice,
        extraAmount: 0,
        totalAmount: service.startingPrice,
        issuedAt: new Date(),
      },
    });

    // Notify & emit socket updates
    if (io) {
      io.to(`user_${req.user._id}`).emit('booking_created', newBooking);
      io.to(`user_${assignedProvider.userId}`).emit('new_job_assigned', {
        bookingId: newBooking.bookingId,
        serviceTitle: newBooking.serviceTitle,
        city: newBooking.city,
        scheduledDate: newBooking.scheduledDate,
        timeSlot: newBooking.timeSlot,
      });
      io.to(`providers_${bookingCity.toLowerCase()}`).emit('new_job_broadcast', {
        bookingId: newBooking.bookingId,
        serviceTitle: newBooking.serviceTitle,
        city: newBooking.city,
      });
    }

    await notifyUser({
      userId: req.user._id,
      role: 'customer',
      title: 'Booking Confirmed',
      message: `Your booking #${newBooking.bookingId} for ${service.title} has been placed. Finish Code: ${completionOtp}`,
      link: `/track/${newBooking._id}`,
    });

    await notifyUser({
      userId: assignedProvider.userId,
      role: 'provider',
      title: 'New Service Job Assigned',
      message: `You have been assigned booking #${newBooking.bookingId} in ${bookingCity} for ${service.title}.`,
      link: `/provider/dashboard`,
    });

    res.status(201).json({
      success: true,
      message: 'Booking placed successfully!',
      booking: newBooking,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/mine
export const getMyBookings = async (req, res, next) => {
  try {
    let bookings = [];

    if (req.user.role === 'customer') {
      bookings = await Booking.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ userId: req.user._id });
      if (!provider) {
        return res.status(200).json({ success: true, count: 0, bookings: [] });
      }
      // Never send completion finish code to provider!
      bookings = await Booking.find({ providerId: provider._id })
        .select('-completionOtp')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'admin') {
      const { status, city } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (city) filter.city = new RegExp(`^${city}$`, 'i');
      bookings = await Booking.find(filter).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    // Role-based authorization check
    const isCustomer = String(booking.customerId) === String(req.user._id);
    let isProvider = false;
    if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ userId: req.user._id });
      if (provider && booking.providerId && String(booking.providerId) === String(provider._id)) {
        isProvider = true;
      }
    }
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this booking.',
      });
    }

    // Format response: Never send completion finish code to the provider
    const bookingObj = booking.toObject();
    if (isProvider && !isAdmin) {
      delete bookingObj.completionOtp;
    }

    res.status(200).json({
      success: true,
      booking: bookingObj,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (String(booking.customerId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the booking customer can cancel.' });
    }

    if (booking.status !== 'REQUESTED' && booking.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled once status is ${booking.status}.`,
      });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Cancelled by customer';
    booking.cancelledBy = req.user.role;
    await booking.save();

    if (io) {
      io.to(`booking_${booking._id}`).emit('booking_status_updated', {
        bookingId: booking._id,
        status: 'CANCELLED',
        reason: booking.cancellationReason,
      });
      io.to(`user_${booking.customerId}`).emit('booking_updated', booking);
      if (booking.providerId) {
        const provider = await Provider.findById(booking.providerId);
        if (provider) {
          io.to(`user_${provider.userId}`).emit('booking_updated', booking);
        }
      }
    }

    await notifyUser({
      userId: booking.customerId,
      role: 'customer',
      title: 'Booking Cancelled',
      message: `Your booking #${booking.bookingId} has been successfully cancelled.`,
      link: `/bookings`,
    });

    res.status(200).json({
      success: true,
      message: 'Booking has been cancelled.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/reschedule
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledDate, timeSlot } = req.body;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (String(booking.customerId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the customer can reschedule.' });
    }

    if (booking.status !== 'REQUESTED' && booking.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be rescheduled once status is ${booking.status}.`,
      });
    }

    const newDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(newDate.getTime()) || newDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Rescheduled date cannot be in the past.',
      });
    }

    booking.scheduledDate = scheduledDate;
    if (timeSlot) booking.timeSlot = timeSlot;
    await booking.save();

    if (io) {
      io.to(`booking_${booking._id}`).emit('booking_updated', booking);
      io.to(`user_${booking.customerId}`).emit('booking_updated', booking);
    }

    await notifyUser({
      userId: booking.customerId,
      role: 'customer',
      title: 'Booking Rescheduled',
      message: `Booking #${booking.bookingId} rescheduled to ${scheduledDate} (${booking.timeSlot}).`,
      link: `/track/${booking._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/quotation/approve
export const approveQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (String(booking.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the customer can approve quotations.' });
    }

    if (!booking.quotation || booking.quotation.status !== 'PENDING_CUSTOMER_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'There is no pending quotation waiting for customer approval.',
      });
    }

    booking.quotation.status = 'APPROVED';
    booking.quotation.updatedAt = new Date();
    booking.invoice.extraAmount = booking.quotation.total;
    booking.invoice.totalAmount = booking.basePrice + (booking.quotation.total || 0);
    await booking.save();

    if (io) {
      io.to(`booking_${booking._id}`).emit('quotation_decision', { status: 'APPROVED', quotation: booking.quotation });
      io.to(`user_${booking.customerId}`).emit('booking_updated', booking);
    }

    res.status(200).json({
      success: true,
      message: 'Spare parts quotation approved.',
      quotation: booking.quotation,
      invoice: booking.invoice,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/quotation/decline
export const declineQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (String(booking.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the customer can decline quotations.' });
    }

    if (!booking.quotation || booking.quotation.status !== 'PENDING_CUSTOMER_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'There is no pending quotation waiting for customer approval.',
      });
    }

    booking.quotation.status = 'REJECTED';
    booking.quotation.updatedAt = new Date();
    await booking.save();

    if (io) {
      io.to(`booking_${booking._id}`).emit('quotation_decision', { status: 'REJECTED', quotation: booking.quotation });
      io.to(`user_${booking.customerId}`).emit('booking_updated', booking);
    }

    res.status(200).json({
      success: true,
      message: 'Spare parts quotation declined.',
      quotation: booking.quotation,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/review (customer only, only after COMPLETED, only once)
export const submitReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, photos } = req.body;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (String(booking.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the customer who booked this service can review it.' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the service has been COMPLETED.',
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: req.user._id,
      authorName: req.user.name,
      providerId: booking.providerId,
      serviceTitle: booking.serviceTitle,
      rating: Number(rating),
      comment: comment.trim(),
      photos: Array.isArray(photos) ? photos : [],
    });

    // Update the provider's average rating and count on the server
    if (booking.providerId) {
      const allReviews = await Review.find({ providerId: booking.providerId, isHidden: false });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Provider.findByIdAndUpdate(booking.providerId, {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: allReviews.length,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been recorded.',
      review,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/complaint (customer only)
export const submitComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, claimAmount, notes } = req.body;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (String(booking.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the booking customer can file a complaint.' });
    }

    const disputeNumber = `DSP-${Math.floor(10000 + Math.random() * 90000)}`;

    const dispute = await Dispute.create({
      disputeId: disputeNumber,
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: req.user._id,
      customerName: req.user.name,
      providerId: booking.providerId,
      providerName: booking.providerName,
      reason,
      claimAmount: Number(claimAmount) || booking.basePrice,
      notes: notes.trim(),
      status: 'OPEN',
    });

    booking.status = 'DISPUTED';
    await booking.save();

    if (io) {
      io.to(`booking_${booking._id}`).emit('booking_disputed', dispute);
      io.to(`user_${booking.customerId}`).emit('booking_updated', booking);
    }

    await notifyUser({
      userId: req.user._id,
      role: 'customer',
      title: 'Dispute Ticket Registered',
      message: `Your dispute ticket #${dispute.disputeId} regarding booking #${booking.bookingId} has been submitted for review.`,
      type: 'dispute',
      link: `/bookings`,
    });

    res.status(201).json({
      success: true,
      message: 'Your complaint has been submitted. Our trust & resolution team will review within 24 hours.',
      dispute,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/status (assigned provider or admin only)
// Status moves MUST follow: REQUESTED -> ACCEPTED -> ON_THE_WAY -> WORKING -> COMPLETED
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: nextStatus, finishCode } = req.body;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingId: String(id).toUpperCase() },
      ],
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Authorization: Assigned provider or admin
    let isProvider = false;
    let providerDoc = null;
    if (req.user.role === 'provider') {
      providerDoc = await Provider.findOne({ userId: req.user._id });
      if (providerDoc && booking.providerId && String(booking.providerId) === String(providerDoc._id)) {
        isProvider = true;
      }
    }
    const isAdmin = req.user.role === 'admin';

    if (!isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the assigned provider or administration can update job status.',
      });
    }

    const validProgression = {
      REQUESTED: 'ACCEPTED',
      ACCEPTED: 'ON_THE_WAY',
      ON_THE_WAY: 'WORKING',
      WORKING: 'COMPLETED',
    };

    if (validProgression[booking.status] !== nextStatus && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: `Invalid status change: Current status '${booking.status}' can only move to '${validProgression[booking.status]}'.`,
      });
    }

    // If moving to COMPLETED, verify finish code!
    if (nextStatus === 'COMPLETED') {
      if (!finishCode || String(finishCode).trim() !== String(booking.completionOtp).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid 4-digit finish code. Please ask the customer to provide the code from their booking screen.',
        });
      }
      booking.paymentStatus = 'PAID';
      booking.invoice.status = 'PAID';
      booking.invoice.paidAt = new Date();

      if (providerDoc) {
        providerDoc.jobsDone = (providerDoc.jobsDone || 0) + 1;
        await providerDoc.save();
      }
    }

    booking.status = nextStatus;

    // Update timeline step
    const timelineStepMap = {
      ACCEPTED: 'Technician Assigned',
      ON_THE_WAY: 'On The Way',
      WORKING: 'Service in Progress',
      COMPLETED: 'Completed',
    };

    const targetStep = timelineStepMap[nextStatus];
    if (targetStep) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      booking.timeline = booking.timeline.map((item) => {
        if (item.step === targetStep) {
          return { ...item, done: true, current: true, time: nowStr };
        }
        return { ...item, current: false };
      });
    }

    await booking.save();

    if (io) {
      io.to(`booking_${booking._id}`).emit('booking_status_updated', {
        bookingId: booking._id,
        status: booking.status,
        timeline: booking.timeline,
      });
      io.to(`user_${booking.customerId}`).emit('booking_updated', booking);
      if (providerDoc) {
        io.to(`user_${providerDoc.userId}`).emit('booking_updated', booking);
      }
    }

    await notifyUser({
      userId: booking.customerId,
      role: 'customer',
      title: `Booking Update: ${nextStatus.replace(/_/g, ' ')}`,
      message: `Your booking #${booking.bookingId} is now ${nextStatus.replace(/_/g, ' ')}.`,
      link: `/track/${booking._id}`,
    });

    const respBooking = booking.toObject();
    if (req.user.role === 'provider' && !isAdmin) {
      delete respBooking.completionOtp;
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${nextStatus}.`,
      booking: respBooking,
    });
  } catch (err) {
    next(err);
  }
};

