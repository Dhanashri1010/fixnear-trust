import { Router } from 'express';
import { z } from 'zod';
import { startSkillTest, submitSkillTest } from '../controllers/skillTestController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const submitTestSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Test sessionId is required'),
    answers: z.array(
      z.object({
        questionId: z.string().min(1, 'Question ID is required'),
        selectedIndex: z.number().int().min(0).max(3),
      })
    ),
    warningCount: z.number().int().min(0).optional(),
  }),
});

// All skill test routes require provider authentication
router.use(authenticate, authorize('provider'));

// GET /api/skill-test/:categoryId (starts exam session, returns 10 questions without answers)
router.get('/skill-test/:categoryId', startSkillTest);

// POST /api/skill-test/:categoryId/submit (submits session for grading)
router.post('/skill-test/:categoryId/submit', validate(submitTestSchema), submitSkillTest);

export default router;

