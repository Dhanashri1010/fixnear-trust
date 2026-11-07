import { Router } from 'express';
import { z } from 'zod';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
  approveQuotation,
  declineQuotation,
  submitReview,
  submitComplaint,
  updateBookingStatus,
  declineBooking,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Zod Schemas
const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1, 'Service ID is required'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    scheduledDate: z.string().min(1, 'Scheduled date is required'),
    timeSlot: z.string().min(1, 'Time slot is required'),
    notes: z.string().optional(),
    photos: z.array(z.string()).optional(),
  }),
});

const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});

const rescheduleBookingSchema = z.object({
  body: z.object({
    scheduledDate: z.string().min(1, 'New scheduled date is required'),
    timeSlot: z.string().min(1, 'New time slot is required'),
  }),
});

const reviewBookingSchema = z.object({
  body: z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(3, 'Comment must be at least 3 characters'),
    photos: z.array(z.string()).optional(),
  }),
});

const complaintBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(3, 'Reason is required'),
    claimAmount: z.number().optional(),
    notes: z.string().min(5, 'Please provide details of the complaint'),
  }),
});

const statusBookingSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'ON_THE_WAY', 'WORKING', 'COMPLETED']),
    finishCode: z.string().optional(),
  }),
});

// All booking routes require authentication
router.use(authenticate);

// Customer bookings
router.post('/bookings', authorize('customer'), validate(createBookingSchema), createBooking);
router.get('/bookings/mine', getMyBookings);
router.get('/bookings/:id', getBookingById);

// Actions
router.patch('/bookings/:id/cancel', authorize('customer', 'admin'), validate(cancelBookingSchema), cancelBooking);
router.patch('/bookings/:id/reschedule', authorize('customer', 'admin'), validate(rescheduleBookingSchema), rescheduleBooking);
router.patch('/bookings/:id/quotation/approve', authorize('customer'), approveQuotation);
router.patch('/bookings/:id/quotation/decline', authorize('customer'), declineQuotation);
router.post('/bookings/:id/review', authorize('customer'), validate(reviewBookingSchema), submitReview);
router.post('/bookings/:id/complaint', authorize('customer'), validate(complaintBookingSchema), submitComplaint);

// Status transition route (assigned provider or admin)
router.patch('/bookings/:id/status', authorize('provider', 'admin'), validate(statusBookingSchema), updateBookingStatus);
router.patch('/bookings/:id/decline', authorize('provider'), declineBooking);

export default router;

