// ===================================================================
// FixNear Trust - Central Administrator Controller (Phase D)
// Real MongoDB Data | Role-Enforced | Fully Audit Logged
// ===================================================================

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';
import { Question } from '../models/Question.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';
import { Setting } from '../models/Setting.js';
import { AuditLog } from '../models/AuditLog.js';
import { Payment } from '../models/Payment.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { logAudit } from '../utils/auditLogger.js';
import { notifyUser } from './notificationController.js';
import { sendComplaintResolvedEmail, sendProviderStatusEmail } from '../utils/emailHelper.js';
import { offerBookingToNextProvider } from './bookingController.js';
import { toBookingPayload } from '../utils/bookingSerializer.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { io } from '../server.js';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. GET /api/admin/stats (Comprehensive Management Dashboard)
export const getAdminStats = async (req, res, next) => {
  try {
    const settings = await Setting.getSettings();
    const fee = settings.platformFee || 20;
    const commissionPercent = settings.platformCommissionPercent || 10;

    // Run parallel aggregation and counts
    const [
      totalBookings,
      activeJobs,
      providersOnline,
      providersWaiting,
      openComplaints,
      totalCustomers,
      totalProviders,
      completedBookings,
      allReviews,
      topProviders,
      waitingApprovals,
      openDisputesList,
      flaggedProvidersList,
      noProviderBookingsList,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['ACCEPTED', 'ON_THE_WAY', 'WORKING'] } }),
      Provider.countDocuments({ isOnline: true }),
      Provider.countDocuments({ status: 'waiting_for_approval' }),
      Dispute.countDocuments({ status: 'OPEN' }),
      User.countDocuments({ role: 'customer' }),
      Provider.countDocuments(),
      Booking.find({ status: 'COMPLETED' }).select('basePrice invoice createdAt updatedAt'),
      Review.find({ isHidden: false }).select('rating'),
      Provider.find({ status: 'approved' }).sort({ ratingAvg: -1, ratingCount: -1 }).limit(5),
      Provider.find({ status: 'waiting_for_approval' }).select('name email phone city specialty skills createdAt').limit(10),
      Dispute.find({ status: 'OPEN' }).select('disputeId bookingId reason customerName providerName claimAmount createdAt').limit(10),
      Provider.find({ ratingAvg: { $lt: 3.5 }, ratingCount: { $gte: 5 } }).select('name email phone ratingAvg ratingCount status city').limit(10),
      Booking.find({ status: 'NO_PROVIDER_FOUND' }).select('bookingId serviceTitle city createdAt').limit(10),
    ]);

    // Financial calculations
    let grossRevenue = 0;
    let totalPlatformFees = 0;

    completedBookings.forEach((b) => {
      const gross = b.invoice?.totalAmount || b.basePrice || 0;
      grossRevenue += gross;
      const commission = Math.round(gross * (commissionPercent / 100));
      totalPlatformFees += commission + fee;
    });

    const netTechnicianPayouts = Math.max(0, grossRevenue - totalPlatformFees);

    // Platform Average Rating
    const averageRating =
      allReviews.length > 0
        ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2))
        : 5.0;

    // Last 7 days booking trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const count = await Booking.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
      last7Days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        activeJobs,
        providersOnline,
        providersWaiting,
        providersWaitingApproval: providersWaiting,
        openComplaints,
        totalCustomers,
        totalProviders,
        grossRevenue,
        totalPlatformFees,
        netTechnicianPayouts,
        averageRating,
        bookingsPerDay: last7Days,
        topProviders,
        settings: {
          platformFee: fee,
          commissionPercent,
        },
        needsAction: {
          waitingApprovals,
          openComplaints: openDisputesList,
          flaggedProviders: flaggedProvidersList,
          noProviderBookings: noProviderBookingsList,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. APPROVALS DESK
// GET /api/admin/approvals
export const getApprovalsList = async (req, res, next) => {
  try {
    const candidates = await Provider.find({ status: 'waiting_for_approval' })
      .populate('userId', 'email phone name createdAt isBlocked')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/providers/:id (Full provider details + exam attempts + document access)
export const getProviderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const provider = await Provider.findOne({
      $or: [...(isObjectId ? [{ _id: id }] : []), { userId: id }],
    }).populate('userId', 'email phone name isBlocked blockedReason createdAt');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    // Fetch test attempts
    const testAttempts = await TestAttempt.find({ providerId: provider.userId || provider._id }).sort({ createdAt: -1 });

    // Generate authenticated signed URLs for admin viewing
    let idProofSignedUrl = provider.idProofUrl || '';
    let certificateSignedUrl = provider.certificateUrl || '';

    if (provider.idProofPublicId && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        idProofSignedUrl = cloudinary.url(provider.idProofPublicId, {
          sign_url: true,
          type: 'authenticated',
          resource_type: provider.idProofResourceType || 'image',
          expires_at: Math.floor(Date.now() / 1000) + 900,
        });
      } catch (e) {
        idProofSignedUrl = `/api/providers/documents/idProof/file?providerId=${provider._id}`;
      }
    } else if (provider.idProofPublicId) {
      idProofSignedUrl = `/api/providers/documents/idProof/file?providerId=${provider._id}`;
    }

    if (provider.certificatePublicId && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        certificateSignedUrl = cloudinary.url(provider.certificatePublicId, {
          sign_url: true,
          type: 'authenticated',
          resource_type: provider.certificateResourceType || 'image',
          expires_at: Math.floor(Date.now() / 1000) + 900,
        });
      } catch (e) {
        certificateSignedUrl = `/api/providers/documents/certificate/file?providerId=${provider._id}`;
      }
    } else if (provider.certificatePublicId) {
      certificateSignedUrl = `/api/providers/documents/certificate/file?providerId=${provider._id}`;
    }

    res.status(200).json({
      success: true,
      provider,
      testAttempts,
      documents: {
        idProof: {
          url: idProofSignedUrl,
          publicId: provider.idProofPublicId,
          resourceType: provider.idProofResourceType || 'image',
        },
        certificate: {
          url: certificateSignedUrl,
          publicId: provider.certificatePublicId,
          resourceType: provider.certificateResourceType || 'image',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/approvals/:id/approve
export const approveProviderAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const oldStatus = provider.status;
    provider.status = 'approved';
    provider.verifiedBadge = true;
    provider.rejectionReason = '';
    provider.adminMessage = '';
    await provider.save();

    await notifyUser({
      userId: provider.userId,
      role: 'provider',
      title: 'Provider Application Approved! 🎉',
      message: 'Congratulations! Your KYC documents and skill certification have been approved by administration. You can now toggle Online and receive customer dispatches.',
      type: 'system',
      link: '/provider/dashboard',
    });

    const providerUser = await User.findById(provider.userId);
    sendProviderStatusEmail({
      providerEmail: provider.email,
      providerName: provider.name,
      status: 'approved',
      lang: providerUser?.preferredLanguage || 'en',
    }).catch(() => { });

    await logAudit({
      req,
      action: 'APPROVE_PROVIDER',
      targetType: 'Provider',
      targetId: provider._id,
      details: { oldStatus, newStatus: 'approved', providerName: provider.name, email: provider.email },
    });

    res.status(200).json({
      success: true,
      message: `Provider ${provider.name} has been approved and activated.`,
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/approvals/:id/reject
export const rejectProviderAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Rejection reason must be at least 5 characters long.' });
    }

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const oldStatus = provider.status;
    provider.status = 'rejected';
    provider.rejectionReason = reason.trim();
    provider.isOnline = false;
    await provider.save();

    await notifyUser({
      userId: provider.userId,
      role: 'provider',
      title: 'Provider KYC Review Update',
      message: `Your verification submission was not approved. Reason: "${reason.trim()}". You can update your details and resubmit in your provider portal.`,
      type: 'system',
      link: '/provider/register',
    });

    const providerUser = await User.findById(provider.userId);
    sendProviderStatusEmail({
      providerEmail: provider.email,
      providerName: provider.name,
      status: 'rejected',
      reason: reason.trim(),
      lang: providerUser?.preferredLanguage || 'en',
    }).catch(() => { });

    await logAudit({
      req,
      action: 'REJECT_PROVIDER',
      targetType: 'Provider',
      targetId: provider._id,
      details: { oldStatus, newStatus: 'rejected', reason: reason.trim(), providerName: provider.name },
    });

    res.status(200).json({
      success: true,
      message: `Provider ${provider.name} has been rejected.`,
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/approvals/:id/request-info
export const requestProviderInfoAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || String(message).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Information request message must be at least 5 characters long.' });
    }

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const oldStatus = provider.status;
    provider.status = 'needs_info';
    provider.adminMessage = message.trim();
    await provider.save();

    await notifyUser({
      userId: provider.userId,
      role: 'provider',
      title: 'Action Required: Additional Information Requested',
      message: `FixNear administration requested further clarification: "${message.trim()}". Please update your profile.`,
      type: 'system',
      link: '/provider/register',
    });

    const providerUser = await User.findById(provider.userId);
    sendProviderStatusEmail({
      providerEmail: provider.email,
      providerName: provider.name,
      status: 'needs_info',
      reason: message.trim(),
      lang: providerUser?.preferredLanguage || 'en',
    }).catch(() => { });

    await logAudit({
      req,
      action: 'REQUEST_PROVIDER_INFO',
      targetType: 'Provider',
      targetId: provider._id,
      details: { oldStatus, newStatus: 'needs_info', message: message.trim(), providerName: provider.name },
    });

    res.status(200).json({
      success: true,
      message: `Information request sent to ${provider.name}.`,
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// 3. PROVIDERS DIRECTORY & QUALITY WATCHDOG
// GET /api/admin/providers
export const getProvidersList = async (req, res, next) => {
  try {
    const { status, skill, city, search, flagged } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (city && city !== 'all') {
      filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, 'i');
    }
    if (skill && skill !== 'all') {
      filter.$or = [
        { 'skills.categoryId': skill },
        { 'skills.categoryName': new RegExp(escapeRegex(skill), 'i') },
        { specialty: new RegExp(escapeRegex(skill), 'i') },
      ];
    }
    if (flagged === 'true' || flagged === true) {
      filter.ratingAvg = { $lt: 3.5 };
      filter.ratingCount = { $gte: 5 };
    }
    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { city: regex }];
    }

    const providers = await Provider.find(filter)
      .populate('userId', 'email phone isBlocked createdAt')
      .sort({ createdAt: -1 });

    const formatted = providers.map((p) => {
      const obj = p.toObject();
      obj.isFlagged = (p.ratingAvg || 0) < 3.5 && (p.ratingCount || 0) >= 5;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      providers: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/providers/:id/suspend
export const suspendProviderAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Suspension reason must be at least 5 characters long.' });
    }

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const oldStatus = provider.status;
    provider.status = 'suspended';
    provider.suspensionReason = reason.trim();
    provider.isOnline = false;
    await provider.save();

    // Provider loses open offers immediately; re-offer bookings to next matching providers
    const pendingOfferBookings = await Booking.find({
      status: 'REQUESTED',
      'offeredTo.providerId': provider._id,
      'offeredTo.status': 'PENDING',
    });

    for (const b of pendingOfferBookings) {
      await Booking.updateOne(
        { _id: b._id, 'offeredTo.providerId': provider._id, 'offeredTo.status': 'PENDING' },
        { $set: { 'offeredTo.$.status': 'CANCELLED' } }
      );
      // Re-dispatch to next available provider
      await offerBookingToNextProvider(b._id);
    }

    await notifyUser({
      userId: provider.userId,
      role: 'provider',
      title: 'Provider Account Suspended',
      message: `Your service partner privileges have been suspended. Reason: "${reason.trim()}". Please contact Trust & Safety.`,
      type: 'system',
      link: '/provider/dashboard',
    });

    await logAudit({
      req,
      action: 'SUSPEND_PROVIDER',
      targetType: 'Provider',
      targetId: provider._id,
      details: { oldStatus, newStatus: 'suspended', reason: reason.trim(), providerName: provider.name },
    });

    res.status(200).json({
      success: true,
      message: `Provider ${provider.name} suspended. Open dispatch offers were re-routed.`,
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/providers/:id/reinstate
export const reinstateProviderAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const oldStatus = provider.status;
    provider.status = 'approved';
    provider.suspensionReason = '';
    await provider.save();

    await notifyUser({
      userId: provider.userId,
      role: 'provider',
      title: 'Account Reinstated 🎉',
      message: 'Your service partner privileges have been restored. You can go Online to resume receiving jobs.',
      type: 'system',
      link: '/provider/dashboard',
    });

    await logAudit({
      req,
      action: 'REINSTATE_PROVIDER',
      targetType: 'Provider',
      targetId: provider._id,
      details: { oldStatus, newStatus: 'approved', note: reason || 'Reinstated by admin', providerName: provider.name },
    });

    res.status(200).json({
      success: true,
      message: `Provider ${provider.name} reinstated to active status.`,
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// 4. CUSTOMERS MANAGEMENT
// GET /api/admin/customers
export const getCustomersList = async (req, res, next) => {
  try {
    const { search, isBlocked } = req.query;
    const filter = { role: 'customer' };

    if (isBlocked !== undefined && isBlocked !== 'all') {
      filter.isBlocked = isBlocked === 'true' || isBlocked === true;
    }

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { city: regex }];
    }

    const customers = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/customers/:id/block
export const blockCustomerAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Block reason must be at least 5 characters long.' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    user.isBlocked = true;
    user.blockedReason = reason.trim();
    await user.save();

    // Immediately terminate all active Socket.io connections for this user
    if (io) {
      io.in(`user_${user._id}`).disconnectSockets(true);
    }

    await logAudit({
      req,
      action: 'BLOCK_CUSTOMER',
      targetType: 'User',
      targetId: user._id,
      details: { reason: reason.trim(), customerName: user.name, email: user.email },
    });

    res.status(200).json({
      success: true,
      message: `Customer ${user.name} has been blocked and sessions terminated.`,
      customer: user,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/customers/:id/unblock
export const unblockCustomerAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    user.isBlocked = false;
    user.blockedReason = '';
    await user.save();

    await logAudit({
      req,
      action: 'UNBLOCK_CUSTOMER',
      targetType: 'User',
      targetId: user._id,
      details: { customerName: user.name, email: user.email },
    });

    res.status(200).json({
      success: true,
      message: `Customer ${user.name} has been unblocked.`,
      customer: user,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// 5. BOOKINGS MANAGEMENT
// GET /api/admin/bookings
export const getAdminBookingsList = async (req, res, next) => {
  try {
    const { status, city, providerId, customerId, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (city && city !== 'all') filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, 'i');
    if (providerId) filter.providerId = providerId;
    if (customerId) filter.customerId = customerId;

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { bookingId: regex },
        { serviceTitle: regex },
        { customerName: regex },
        { customerPhone: regex },
        { providerName: regex },
      ];
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings.map((b) => toBookingPayload(b, 'admin')),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/bookings/:id
export const getAdminBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const booking = await Booking.findOne({
      $or: [...(isObjectId ? [{ _id: id }] : []), { bookingId: String(id).toUpperCase() }],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Fetch related dispute and review if any
    const [dispute, review] = await Promise.all([
      Dispute.findOne({ bookingId: booking._id }),
      Review.findOne({ bookingId: booking._id }),
    ]);

    res.status(200).json({
      success: true,
      booking: toBookingPayload(booking, 'admin'),
      dispute,
      review,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/bookings/:id/cancel
export const cancelBookingAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Cancellation reason must be at least 5 characters long.' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const oldStatus = booking.status;
    booking.status = 'CANCELLED';
    booking.cancellationReason = reason.trim();
    booking.cancelledBy = `Admin (${req.user.name})`;
    await booking.save();

    if (io) {
      io.to(`booking_${booking._id}`).emit('booking_updated', toBookingPayload(booking, 'provider'));
      io.to(`user_${booking.customerId}`).emit('booking_updated', toBookingPayload(booking, 'customer'));
      if (booking.providerId) {
        const prov = await Provider.findById(booking.providerId);
        if (prov) io.to(`user_${prov.userId}`).emit('booking_updated', toBookingPayload(booking, 'provider'));
      }
    }

    await notifyUser({
      userId: booking.customerId,
      role: 'customer',
      title: 'Booking Cancelled by Admin',
      message: `Booking #${booking.bookingId} has been cancelled. Reason: "${reason.trim()}". Any hold has been released.`,
      type: 'booking',
      link: '/bookings',
    });

    if (booking.providerId) {
      const prov = await Provider.findById(booking.providerId);
      if (prov) {
        await notifyUser({
          userId: prov.userId,
          role: 'provider',
          title: 'Job Cancelled by Admin',
          message: `Booking #${booking.bookingId} in ${booking.city} was cancelled by administrator.`,
          type: 'booking',
          link: '/provider/dashboard',
        });
      }
    }

    await logAudit({
      req,
      action: 'CANCEL_BOOKING',
      targetType: 'Booking',
      targetId: booking._id,
      details: { bookingId: booking.bookingId, oldStatus, reason: reason.trim() },
    });

    res.status(200).json({
      success: true,
      message: `Booking #${booking.bookingId} cancelled by admin.`,
      booking: toBookingPayload(booking, 'admin'),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/bookings/:id/reassign
export const reassignBookingAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot reassign booking in '${booking.status}' status.` });
    }

    // Reset status to REQUESTED with cleared provider
    booking.status = 'REQUESTED';
    booking.providerId = null;
    booking.providerName = '';
    booking.providerPhone = '';
    await booking.save();

    // Trigger offer flow
    await offerBookingToNextProvider(booking._id);

    await logAudit({
      req,
      action: 'REASSIGN_BOOKING',
      targetType: 'Booking',
      targetId: booking._id,
      details: { bookingId: booking.bookingId, designatedProviderId: providerId || 'auto_next' },
    });

    res.status(200).json({
      success: true,
      message: `Booking #${booking.bookingId} reset and dispatched for reassignment.`,
      booking: toBookingPayload(booking, 'admin'),
    });
  } catch (err) {
    next(err);
  }
};

// 6. SERVICES & CATEGORIES MANAGEMENT
// GET /api/admin/categories
export const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/categories
export const createCategoryAction = async (req, res, next) => {
  try {
    const { categoryId, name, tagline, icon, startingPrice, badge, accentBg, accentText } = req.body;
    const existing = await Category.findOne({ categoryId: String(categoryId).trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category ID already exists.' });
    }

    const category = await Category.create({
      categoryId: String(categoryId).trim().toLowerCase(),
      name: name.trim(),
      tagline: tagline || '',
      icon: icon || 'Wrench',
      startingPrice: Number(startingPrice) || 299,
      badge: badge || '',
      accentBg: accentBg || 'var(--forest-50)',
      accentText: accentText || 'var(--forest-800)',
      isActive: true,
    });

    await logAudit({
      req,
      action: 'CREATE_CATEGORY',
      targetType: 'Category',
      targetId: category._id,
      details: { categoryId: category.categoryId, name: category.name },
    });

    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/categories/:id
export const updateCategoryAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    await logAudit({
      req,
      action: 'UPDATE_CATEGORY',
      targetType: 'Category',
      targetId: category._id,
      details: req.body,
    });

    res.status(200).json({ success: true, message: 'Category updated.', category });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/services
export const getAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ categoryId: 1, startingPrice: 1 });
    res.status(200).json({ success: true, count: services.length, services });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/services
export const createServiceAction = async (req, res, next) => {
  try {
    const { serviceId, categoryId, category, title, startingPrice, originalPrice, duration, features, scope } = req.body;
    const existing = await Service.findOne({ serviceId: String(serviceId).trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Service ID already exists.' });
    }

    const service = await Service.create({
      serviceId: String(serviceId).trim(),
      categoryId: String(categoryId).trim(),
      category: category || categoryId,
      title: title.trim(),
      startingPrice: Number(startingPrice) || 299,
      originalPrice: Number(originalPrice) || 0,
      duration: duration || '45 - 60 mins',
      features: Array.isArray(features) ? features : [],
      scope: scope || { included: [], excluded: [] },
      isActive: true,
    });

    await logAudit({
      req,
      action: 'CREATE_SERVICE',
      targetType: 'Service',
      targetId: service._id,
      details: { serviceId: service.serviceId, title: service.title, startingPrice: service.startingPrice },
    });

    res.status(201).json({ success: true, message: 'Service created.', service });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/services/:id
export const updateServiceAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    await logAudit({
      req,
      action: 'UPDATE_SERVICE',
      targetType: 'Service',
      targetId: service._id,
      details: req.body,
    });

    res.status(200).json({ success: true, message: 'Service updated.', service });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/services/:id/status
export const toggleServiceStatusAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    const newActiveState = !Boolean(service.isActive ?? true);
    service.isActive = newActiveState;
    await service.save();

    await logAudit({
      req,
      action: newActiveState ? 'ENABLE_SERVICE' : 'DISABLE_SERVICE',
      targetType: 'Service',
      targetId: service._id,
      details: { serviceTitle: service.title, isActive: newActiveState },
    });

    res.status(200).json({
      success: true,
      message: `Service "${service.title}" is now ${newActiveState ? 'active' : 'disabled'}.`,
      service,
    });
  } catch (err) {
    next(err);
  }
};

// 7. QUESTION BANK MANAGEMENT
// GET /api/admin/questions (with correctIndex visible)
export const getAdminQuestions = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const filter = {};
    if (categoryId && categoryId !== 'all') {
      filter.categoryId = categoryId;
    }

    const questions = await Question.find(filter)
      .select('+correctIndex +explanation')
      .sort({ categoryId: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/questions/counts (Question counts and <12 warning)
export const getAdminQuestionCounts = async (req, res, next) => {
  try {
    const dbCategories = await Category.find({ isActive: true });
    const distinctCatIds = await Question.distinct('categoryId');

    const catMap = new Map();
    for (const c of dbCategories) {
      catMap.set(c.categoryId, c.name);
    }
    for (const id of distinctCatIds) {
      if (!catMap.has(id)) {
        catMap.set(id, id.charAt(0).toUpperCase() + id.slice(1));
      }
    }

    const counts = await Promise.all(
      Array.from(catMap.entries()).map(async ([catId, name]) => {
        const count = await Question.countDocuments({ categoryId: catId, isActive: true });
        return {
          categoryId: catId,
          categoryName: name,
          count,
          hasSufficientQuestions: count >= 12,
          hasEnough: count >= 12,
          needsMoreQuestions: count < 12,
        };
      })
    );

    res.status(200).json({
      success: true,
      counts,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/questions
export const createQuestionAction = async (req, res, next) => {
  try {
    const { categoryId, categoryName, topic, questionText, options, correctIndex, explanation } = req.body;

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ success: false, message: 'Question must have exactly 4 options.' });
    }
    if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex > 3) {
      return res.status(400).json({ success: false, message: 'Correct index must be 0, 1, 2, or 3.' });
    }

    const question = await Question.create({
      categoryId,
      categoryName,
      topic: topic || 'General Technical',
      questionText: questionText.trim(),
      options: options.map((o) => String(o).trim()),
      correctIndex,
      explanation: explanation || '',
      isActive: true,
    });

    await logAudit({
      req,
      action: 'CREATE_QUESTION',
      targetType: 'Question',
      targetId: question._id,
      details: { categoryId, questionText: question.questionText },
    });

    res.status(201).json({
      success: true,
      message: 'Question added to bank.',
      question,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/questions/:id
export const updateQuestionAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(id, { $set: req.body }, { new: true }).select('+correctIndex +explanation');
    if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });

    await logAudit({
      req,
      action: 'UPDATE_QUESTION',
      targetType: 'Question',
      targetId: question._id,
      details: req.body,
    });

    res.status(200).json({ success: true, message: 'Question updated.', question });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/questions/:id
export const deleteQuestionAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });

    await logAudit({
      req,
      action: 'DELETE_QUESTION',
      targetType: 'Question',
      targetId: id,
      details: { categoryId: question.categoryId, questionText: question.questionText },
    });

    res.status(200).json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    next(err);
  }
};

// 8. SETTINGS MANAGEMENT
// GET /api/admin/settings
export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getSettings();
    const formatted = {
      ...settings.toObject(),
      passMark: settings.skillTestPassMark,
      testDurationMinutes: settings.skillTestTimeLimitMinutes,
      testCooldownHours: settings.skillTestCooldownHours,
      platformFee: settings.platformFee,
      commissionPercent: settings.platformCommissionPercent,
    };
    res.status(200).json({ success: true, settings: formatted });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/settings
export const updateAdminSettingsAction = async (req, res, next) => {
  try {
    const { passMark, testDurationMinutes, testCooldownHours, platformFee, commissionPercent } = req.body;

    const settings = await Setting.getSettings();
    const oldValues = {
      passMark: settings.skillTestPassMark,
      testDurationMinutes: settings.skillTestTimeLimitMinutes,
      testCooldownHours: settings.skillTestCooldownHours,
      platformFee: settings.platformFee,
      commissionPercent: settings.platformCommissionPercent,
    };

    if (passMark !== undefined) {
      const num = Number(passMark);
      if (num < 50 || num > 100) {
        return res.status(400).json({ success: false, message: 'Pass mark must be between 50% and 100%.' });
      }
      settings.skillTestPassMark = num;
    }

    if (testDurationMinutes !== undefined) {
      const num = Number(testDurationMinutes);
      if (num < 5 || num > 60) {
        return res.status(400).json({ success: false, message: 'Test duration must be between 5 and 60 minutes.' });
      }
      settings.skillTestTimeLimitMinutes = num;
    }

    if (testCooldownHours !== undefined) {
      const num = Number(testCooldownHours);
      if (num < 1 || num > 168) {
        return res.status(400).json({ success: false, message: 'Cooldown must be between 1 and 168 hours.' });
      }
      settings.skillTestCooldownHours = num;
    }

    if (platformFee !== undefined) {
      const num = Number(platformFee);
      if (num < 0 || num > 500) {
        return res.status(400).json({ success: false, message: 'Platform fee must be between ₹0 and ₹500.' });
      }
      settings.platformFee = num;
    }

    if (commissionPercent !== undefined) {
      const num = Number(commissionPercent);
      if (num < 0 || num > 40) {
        return res.status(400).json({ success: false, message: 'Commission percent must be between 0% and 40%.' });
      }
      settings.platformCommissionPercent = num;
    }

    await settings.save();

    await logAudit({
      req,
      action: 'UPDATE_SETTINGS',
      targetType: 'Setting',
      targetId: settings._id,
      details: { oldValues, newValues: req.body },
    });

    const formatted = {
      ...settings.toObject(),
      passMark: settings.skillTestPassMark,
      testDurationMinutes: settings.skillTestTimeLimitMinutes,
      testCooldownHours: settings.skillTestCooldownHours,
      platformFee: settings.platformFee,
      commissionPercent: settings.platformCommissionPercent,
    };

    res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully.',
      settings: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// 9. COMPLAINTS & DISPUTE RESOLUTION
// GET /api/admin/disputes
export const getAdminDisputes = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ disputeId: regex }, { customerName: regex }, { providerName: regex }, { reason: regex }];
    }

    const disputes = await Dispute.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: disputes.length, disputes });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/disputes/:id
export const getAdminDisputeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute ticket not found.' });

    const [booking, customer, provider] = await Promise.all([
      Booking.findById(dispute.bookingId),
      User.findById(dispute.customerId).select('name email phone city'),
      dispute.providerId ? Provider.findById(dispute.providerId).select('name email phone city ratingAvg') : null,
    ]);

    res.status(200).json({
      success: true,
      dispute,
      booking: booking ? toBookingPayload(booking, 'admin') : null,
      customer,
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/disputes/:id/resolve
export const resolveDisputeAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { decision, note, refundAmount, providerPayout } = req.body;

    let dec = String(decision || '').toUpperCase();
    if (dec === 'REFUND_CUSTOMER' || dec === 'REFUND') dec = 'REFUND_CUSTOMER';
    else if (dec === 'PAY_PROVIDER' || dec === 'PAY_TECHNICIAN') dec = 'PAY_PROVIDER';
    else if (dec === 'PARTIAL_SPLIT' || dec === 'SPLIT') dec = 'PARTIAL_SPLIT';
    else if (dec === 'REJECT_COMPLAINT' || dec === 'REJECT') dec = 'REJECT_COMPLAINT';

    const validDecisions = ['REFUND_CUSTOMER', 'PAY_PROVIDER', 'PARTIAL_SPLIT', 'REJECT_COMPLAINT'];
    if (!validDecisions.includes(dec)) {
      return res.status(400).json({ success: false, message: 'Invalid decision type. Allowed: REFUND_CUSTOMER, PAY_PROVIDER, PARTIAL_SPLIT, REJECT_COMPLAINT.' });
    }
    if (!note || String(note).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Resolution note must be at least 5 characters long.' });
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute ticket not found.' });

    // Dispute resolution only works on OPEN tickets; second attempt gets 409
    if (dispute.status !== 'OPEN') {
      return res.status(409).json({ success: false, message: 'This complaint has already been resolved.' });
    }

    const booking = await Booking.findById(dispute.bookingId);
    const bookingTotal = (booking?.invoice?.totalAmount || booking?.basePrice || 0) + (booking?.platformFeeSnapshot ?? 20);

    const refNum = Number(refundAmount) || 0;
    const payNum = Number(providerPayout) || 0;

    // Validate refundAmount and providerPayout as whole numbers from 0 to booking total
    if (!Number.isInteger(refNum) || !Number.isInteger(payNum) || refNum < 0 || payNum < 0) {
      return res.status(400).json({ success: false, message: 'Refund amount and technician payout must be non-negative whole numbers.' });
    }

    if (refNum + payNum > bookingTotal) {
      return res.status(400).json({
        success: false,
        message: `Total refund (₹${refNum}) and payout (₹${payNum}) cannot exceed the booking total amount of ₹${bookingTotal}.`,
      });
    }

    dispute.status = 'RESOLVED';
    dispute.decision = dec;
    dispute.adminNote = note.trim();
    dispute.refundAmount = refNum;
    dispute.providerPayout = payNum;
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Update booking disputeStatus; Job status stays unchanged!
    if (booking) {
      booking.disputeStatus = 'RESOLVED';
      await booking.save();
    }

    // Process refund if online payment was made
    if (dec === 'REFUND_CUSTOMER' && refNum > 0 && booking) {
      const payment = await Payment.findOne({ bookingId: booking._id, status: 'PAID' });
      if (payment) {
        if (payment.method === 'ONLINE' && payment.razorpayPaymentId && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
          try {
            if (process.env.NODE_ENV === 'test') {
              payment.refundId = `rfnd_mock_${Date.now()}`;
              payment.refundAmount = refNum;
              payment.refundNotes = note.trim();
              payment.status = refNum >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
              await payment.save();
            } else {
              const Razorpay = (await import('razorpay')).default;
              const rzp = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
              });
              const rzpRefund = await rzp.payments.refund(payment.razorpayPaymentId, {
                amount: refNum * 100, // paisa
                notes: { reason: note.trim(), disputeId: dispute.disputeId },
              });
              payment.refundId = rzpRefund.id;
              payment.refundAmount = refNum;
              payment.refundNotes = note.trim();
              payment.status = refNum >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
              await payment.save();
            }
          } catch (refErr) {
            console.error('[Razorpay Refund Error]:', refErr.message);
          }
        } else if (payment.method === 'CASH') {
          payment.refundNotes = 'To be settled outside the app';
          payment.refundAmount = refNum;
          await payment.save();
        }
      }
    }

    const cleanDecision = dec.replace(/_/g, ' ').toLowerCase();

    // Notify Customer with clean decision text
    await notifyUser({
      userId: dispute.customerId,
      role: 'customer',
      title: 'Dispute Decision Recorded',
      message: `Your dispute ticket #${dispute.disputeId} was resolved: ${cleanDecision}. Decision recorded. Note: "${note.trim()}".`,
      type: 'dispute',
      link: '/bookings',
    });

    // Notify Provider if assigned
    if (dispute.providerId) {
      const prov = await Provider.findById(dispute.providerId);
      if (prov) {
        await notifyUser({
          userId: prov.userId,
          role: 'provider',
          title: 'Dispute Decision Recorded',
          message: `Dispute ticket #${dispute.disputeId} was resolved: ${cleanDecision}. Decision recorded. Note: "${note.trim()}".`,
          type: 'dispute',
          link: '/provider/dashboard',
        });
      }
    }

    // Send confirmation email to customer
    const customerUser = await User.findById(dispute.customerId);
    if (customerUser) {
      sendComplaintResolvedEmail({
        userEmail: customerUser.email,
        userName: customerUser.name,
        disputeId: dispute.disputeId,
        decision: cleanDecision,
        note: note.trim(),
        refundAmount: refNum,
        lang: customerUser.preferredLanguage || 'en',
      }).catch(() => { });
    }

    await logAudit({
      req,
      action: 'RESOLVE_DISPUTE',
      targetType: 'Dispute',
      targetId: dispute._id,
      details: { disputeId: dispute.disputeId, decision: dec, cleanDecision, note: note.trim(), refundAmount: refNum, providerPayout: payNum },
    });

    res.status(200).json({
      success: true,
      message: `Decision recorded for ticket #${dispute.disputeId} (${cleanDecision}).`,
      dispute,
    });
  } catch (err) {
    next(err);
  }
};

// 10. REVIEWS MODERATION
// GET /api/admin/reviews
export const getAdminReviews = async (req, res, next) => {
  try {
    const { providerId, isHidden, search } = req.query;
    const filter = {};
    if (providerId) filter.providerId = providerId;
    if (isHidden !== undefined && isHidden !== 'all') {
      filter.isHidden = isHidden === 'true' || isHidden === true;
    }
    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ authorName: regex }, { comment: regex }, { serviceTitle: regex }];
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reviews/:id/visibility
export const toggleReviewVisibilityAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isHidden, reason } = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    review.isHidden = Boolean(isHidden);
    review.hiddenReason = reason ? String(reason).trim() : '';
    await review.save();

    // Recalculate provider's average rating and count on server!
    if (review.providerId) {
      const activeReviews = await Review.find({ providerId: review.providerId, isHidden: false });
      const avg =
        activeReviews.length > 0
          ? Math.round((activeReviews.reduce((sum, r) => sum + r.rating, 0) / activeReviews.length) * 10) / 10
          : 5.0;

      await Provider.findByIdAndUpdate(review.providerId, {
        ratingAvg: avg,
        ratingCount: activeReviews.length,
      });
    }

    await logAudit({
      req,
      action: isHidden ? 'HIDE_REVIEW' : 'UNHIDE_REVIEW',
      targetType: 'Review',
      targetId: review._id,
      details: { isHidden: Boolean(isHidden), reason: reason || '', providerId: review.providerId },
    });

    res.status(200).json({
      success: true,
      message: `Review is now ${isHidden ? 'hidden' : 'visible'}. Provider rating recalculated.`,
      review,
    });
  } catch (err) {
    next(err);
  }
};

// 11. ADMIN USERS MANAGEMENT
// GET /api/admin/admins
export const getAdminUsers = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: admins.length, admins });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/admins
export const createAdminUserAction = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const newAdmin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      mustChangePassword: true,
      city: 'Mumbai',
    });

    await Setting.findOneAndUpdate(
      { key: 'global_settings' },
      { $inc: { activeAdminCount: 1 } },
      { upsert: true }
    );

    await logAudit({
      req,
      action: 'CREATE_ADMIN',
      targetType: 'Admin',
      targetId: newAdmin._id,
      details: { name: newAdmin.name, email: newAdmin.email },
    });

    res.status(201).json({
      success: true,
      message: `Admin user ${newAdmin.name} created. Password change required on first login.`,
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        mustChangePassword: newAdmin.mustChangePassword,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/admins/:id/deactivate
export const deactivateAdminUserAction = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Admin cannot deactivate themselves
    if (String(req.user._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: 'Security rule: You cannot deactivate your own administrator account.',
      });
    }

    // Atomic conditional check on Setting to prevent concurrent elimination of last active admin
    const currentActiveAdmins = await User.countDocuments({ role: 'admin', isBlocked: false });
    await Setting.findOneAndUpdate(
      { key: 'global_settings' },
      { $set: { activeAdminCount: currentActiveAdmins } },
      { upsert: true }
    );

    const atomicGuard = await Setting.findOneAndUpdate(
      { key: 'global_settings', activeAdminCount: { $gt: 1 } },
      { $inc: { activeAdminCount: -1 } },
      { new: true }
    );

    if (!atomicGuard) {
      return res.status(400).json({
        success: false,
        message: 'Security rule: Cannot deactivate the last remaining active administrator account.',
      });
    }

    // Atomically deactivate the target admin
    const targetAdmin = await User.findOneAndUpdate(
      { _id: id, role: 'admin', isBlocked: false },
      { $set: { isBlocked: true, blockedReason: `Deactivated by administrator ${req.user.name}` } },
      { new: true }
    );

    if (!targetAdmin) {
      // Rollback counter if target admin was not found or already blocked
      await Setting.findOneAndUpdate({ key: 'global_settings' }, { $inc: { activeAdminCount: 1 } });
      return res.status(404).json({ success: false, message: 'Administrator account not found.' });
    }

    // Disconnect active socket sessions
    if (io) {
      io.in(`user_${targetAdmin._id}`).disconnectSockets(true);
    }

    await logAudit({
      req,
      action: 'DEACTIVATE_ADMIN',
      targetType: 'Admin',
      targetId: targetAdmin._id,
      details: { name: targetAdmin.name, email: targetAdmin.email },
    });

    res.status(200).json({
      success: true,
      message: `Administrator ${targetAdmin.name} has been deactivated.`,
      admin: targetAdmin,
    });
  } catch (err) {
    next(err);
  }
};

// 12. AUDIT LOGS (Read-Only)
// GET /api/admin/audit-logs
export const getAuditLogsList = async (req, res, next) => {
  try {
    const { action, targetType, adminId, search, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (action && action !== 'all') filter.action = action;
    if (targetType && targetType !== 'all') filter.targetType = targetType;
    if (adminId) filter.adminId = adminId;
    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ adminEmail: regex }, { action: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (err) {
    next(err);
  }
};
