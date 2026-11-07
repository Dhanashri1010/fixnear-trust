import { Router } from 'express';
import { z } from 'zod';
import {
  getProviders,
  getProviderById,
  getMyProviderProfile,
  registerProviderProfile,
  updateProviderStatus,
  getPrivateDocumentSignedUrl,
} from '../controllers/providerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const registerProviderSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
    phone: z.string().optional(),
    city: z.string().min(2).max(60, 'City name cannot exceed 60 characters').optional(),
    serviceArea: z.string().max(100).optional(),
    specialty: z.string().optional(),
    categoryId: z.string().optional(),
    categoryName: z.string().optional(),
    experienceYears: z.number().min(0).max(50).optional(),
    idProofUrl: z.string().optional(),
    idProofPublicId: z.string().optional(),
    certificateUrl: z.string().optional(),
    certificatePublicId: z.string().optional(),
  }),
});

const statusSchema = z.object({
  body: z.object({
    isOnline: z.boolean(),
  }),
});

// Public provider listings & profile
router.get('/providers', getProviders);

// Authenticated provider operations
router.get('/providers/me', authenticate, authorize('provider'), getMyProviderProfile);
router.patch('/providers/me/status', authenticate, authorize('provider'), validate(statusSchema), updateProviderStatus);
router.post('/providers/register', authenticate, authorize('provider'), validate(registerProviderSchema), registerProviderProfile);
router.get('/providers/documents/:type', authenticate, authorize('provider', 'admin'), getPrivateDocumentSignedUrl);

// Public provider profile by ID
router.get('/providers/:id', getProviderById);

export default router;
