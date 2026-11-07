// ===================================================================
// FixNear Trust - Administrator Router (Phase D)
// Prefix: /api/admin | All routes require role 'admin' | Zod validated
// ===================================================================

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import {
  getAdminStats,
  getApprovalsList,
  getProviderDetails,
  approveProviderAction,
  rejectProviderAction,
  requestProviderInfoAction,
  getProvidersList,
  suspendProviderAction,
  reinstateProviderAction,
  getCustomersList,
  blockCustomerAction,
  unblockCustomerAction,
  getAdminBookingsList,
  getAdminBookingDetails,
  cancelBookingAction,
  reassignBookingAction,
  getAdminCategories,
  createCategoryAction,
  updateCategoryAction,
  getAdminServices,
  createServiceAction,
  updateServiceAction,
  toggleServiceStatusAction,
  getAdminQuestions,
  getAdminQuestionCounts,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  getAdminSettings,
  updateAdminSettingsAction,
  getAdminDisputes,
  getAdminDisputeDetails,
  resolveDisputeAction,
  getAdminReviews,
  toggleReviewVisibilityAction,
  getAdminUsers,
  createAdminUserAction,
  deactivateAdminUserAction,
  getAuditLogsList,
} from '../controllers/adminController.js';

const router = Router();

// Zod Validation Schemas
const reasonSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters long'),
  }),
});

const requestInfoSchema = z.object({
  body: z.object({
    message: z.string().min(5, 'Message must be at least 5 characters long'),
  }),
});

const reinstateSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});

const reassignSchema = z.object({
  body: z.object({
    providerId: z.string().optional(),
  }),
});

const createCategorySchema = z.object({
  body: z.object({
    categoryId: z.string().min(2, 'Category ID must be at least 2 characters'),
    name: z.string().min(2, 'Category Name must be at least 2 characters'),
    tagline: z.string().optional(),
    icon: z.string().optional(),
    startingPrice: z.number().min(0, 'Starting price cannot be negative').optional(),
    badge: z.string().optional(),
    accentBg: z.string().optional(),
    accentText: z.string().optional(),
  }),
});

const createServiceSchema = z.object({
  body: z.object({
    serviceId: z.string().min(2, 'Service ID must be at least 2 characters'),
    categoryId: z.string().min(2, 'Category ID is required'),
    category: z.string().optional(),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    startingPrice: z.number().min(0, 'Starting price cannot be negative'),
    originalPrice: z.number().min(0).optional(),
    duration: z.string().optional(),
    features: z.array(z.string()).optional(),
  }),
});

const createQuestionSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    categoryName: z.string().min(1, 'Category Name is required'),
    topic: z.string().optional(),
    questionText: z.string().min(5, 'Question text must be at least 5 characters'),
    options: z.array(z.string().min(1)).length(4, 'Exactly 4 options are required'),
    correctIndex: z.number().int().min(0).max(3, 'Correct index must be 0, 1, 2, or 3'),
    explanation: z.string().optional(),
  }),
});

const updateSettingsSchema = z.object({
  body: z.object({
    passMark: z.number().int().min(50, 'Pass mark minimum is 50%').max(100, 'Pass mark maximum is 100%').optional(),
    testDurationMinutes: z.number().int().min(5, 'Duration minimum is 5 mins').max(60, 'Duration maximum is 60 mins').optional(),
    testCooldownHours: z.number().int().min(1, 'Cooldown minimum is 1 hour').max(168, 'Cooldown maximum is 168 hours').optional(),
    platformFee: z.number().int().min(0, 'Platform fee minimum is 0').max(500, 'Platform fee maximum is ₹500').optional(),
    commissionPercent: z.number().int().min(0, 'Commission minimum is 0%').max(40, 'Commission maximum is 40%').optional(),
  }),
});

const resolveDisputeSchema = z.object({
  body: z.object({
    decision: z.enum(['REFUND_CUSTOMER', 'PAY_PROVIDER', 'PARTIAL_SPLIT']),
    note: z.string().min(5, 'Resolution note must be at least 5 characters long'),
    refundAmount: z.number().min(0).optional(),
    providerPayout: z.number().min(0).optional(),
  }),
});

const toggleReviewVisibilitySchema = z.object({
  body: z.object({
    isHidden: z.boolean(),
    reason: z.string().optional(),
  }),
});

const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  }),
});

// 1. Dashboard Stats
router.get('/stats', getAdminStats);

// 2. Approvals
router.get('/approvals', getApprovalsList);
router.post('/approvals/:id/approve', approveProviderAction);
router.post('/approvals/:id/reject', validate(reasonSchema), rejectProviderAction);
router.post('/approvals/:id/request-info', validate(requestInfoSchema), requestProviderInfoAction);

// 3. Providers
router.get('/providers', getProvidersList);
router.get('/providers/:id', getProviderDetails);
router.post('/providers/:id/suspend', validate(reasonSchema), suspendProviderAction);
router.post('/providers/:id/reinstate', validate(reinstateSchema), reinstateProviderAction);

// 4. Customers
router.get('/customers', getCustomersList);
router.post('/customers/:id/block', validate(reasonSchema), blockCustomerAction);
router.post('/customers/:id/unblock', unblockCustomerAction);

// 5. Bookings
router.get('/bookings', getAdminBookingsList);
router.get('/bookings/:id', getAdminBookingDetails);
router.post('/bookings/:id/cancel', validate(reasonSchema), cancelBookingAction);
router.post('/bookings/:id/reassign', validate(reassignSchema), reassignBookingAction);

// 6. Services & Categories
router.get('/categories', getAdminCategories);
router.post('/categories', validate(createCategorySchema), createCategoryAction);
router.patch('/categories/:id', updateCategoryAction);
router.get('/services', getAdminServices);
router.post('/services', validate(createServiceSchema), createServiceAction);
router.patch('/services/:id', updateServiceAction);
router.patch('/services/:id/status', toggleServiceStatusAction);

// 7. Question Bank
router.get('/questions', getAdminQuestions);
router.get('/questions/counts', getAdminQuestionCounts);
router.post('/questions', validate(createQuestionSchema), createQuestionAction);
router.patch('/questions/:id', updateQuestionAction);
router.delete('/questions/:id', deleteQuestionAction);

// 8. Settings
router.get('/settings', getAdminSettings);
router.patch('/settings', validate(updateSettingsSchema), updateAdminSettingsAction);

// 9. Complaints
router.get('/disputes', getAdminDisputes);
router.get('/disputes/:id', getAdminDisputeDetails);
router.post('/disputes/:id/resolve', validate(resolveDisputeSchema), resolveDisputeAction);

// 10. Reviews
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/visibility', validate(toggleReviewVisibilitySchema), toggleReviewVisibilityAction);

// 11. Admin Users
router.get('/admins', getAdminUsers);
router.post('/admins', validate(createAdminSchema), createAdminUserAction);
router.post('/admins/:id/deactivate', deactivateAdminUserAction);

// 12. Audit Logs
router.get('/audit-logs', getAuditLogsList);

export default router;

