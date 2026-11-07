import { Router } from 'express';
import { getPlatformSettings } from '../controllers/settingController.js';

const router = Router();

// GET /api/settings (public)
router.get('/settings', getPlatformSettings);

export default router;

