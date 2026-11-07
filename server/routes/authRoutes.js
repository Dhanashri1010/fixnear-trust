import { Router } from 'express';
import { z } from 'zod';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword,
  changePassword,
  downloadMyData,
  deleteMyAccount,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginRateLimiter, authActionRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Zod Validation Schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
    role: z.enum(['customer', 'provider', 'admin']).optional(),
    phone: z.string().optional(),
    city: z.string().max(60, 'City name cannot exceed 60 characters').optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  }),
});

const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password confirmation is required to delete your account'),
  }),
});

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', loginRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, authActionRateLimiter, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', authActionRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authActionRateLimiter, validate(resetPasswordSchema), resetPassword);
router.get('/download-data', authenticate, downloadMyData);
router.post('/delete-account', authenticate, authActionRateLimiter, validate(deleteAccountSchema), deleteMyAccount);

export default router;
