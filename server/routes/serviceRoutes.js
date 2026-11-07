import { Router } from 'express';
import { getCategories, getServices, getServiceById, getPublicReviews } from '../controllers/serviceController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/services', getServices);
router.get('/services/:id', getServiceById);
router.get('/reviews', getPublicReviews);

export default router;
