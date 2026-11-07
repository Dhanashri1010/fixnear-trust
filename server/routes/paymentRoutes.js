import { Router } from 'express';
import { z } from 'zod';
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  confirmCashPayment,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { paymentRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const orderSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
  }),
});

const verifySchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
    razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
  }),
});

const cashConfirmSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
  }),
});

// Public config check (returns whether Razorpay is enabled and public key ID)
router.get('/config', getPaymentConfig);

// Create online order (Server calculates amount; client passes only bookingId)
router.post(
  '/order',
  authenticate,
  authorize('customer', 'admin'),
  paymentRateLimiter,
  validate(orderSchema),
  createPaymentOrder
);

// Verify online signature & issue receipt
router.post(
  '/verify',
  authenticate,
  authorize('customer', 'admin'),
  paymentRateLimiter,
  validate(verifySchema),
  verifyPayment
);

// Confirm cash payment (Technician confirmation)
router.post(
  '/cash-confirm',
  authenticate,
  authorize('provider', 'admin'),
  paymentRateLimiter,
  validate(cashConfirmSchema),
  confirmCashPayment
);

export default router;

