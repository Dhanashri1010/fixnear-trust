import { Router } from 'express';
import { getProviders, getProviderById } from '../controllers/providerController.js';

const router = Router();

router.get('/providers', getProviders);
router.get('/providers/:id', getProviderById);

export default router;

