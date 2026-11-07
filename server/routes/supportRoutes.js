import { Router } from 'express';
import { z } from 'zod';
import { createSupportTicket, getMySupportTickets } from '../controllers/supportController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    message: z.string().min(5, 'Message must be at least 5 characters'),
    bookingId: z.string().optional(),
  }),
});

router.use('/support', authenticate);

router.post('/support', validate(createTicketSchema), createSupportTicket);
router.get('/support/mine', getMySupportTickets);

export default router;

