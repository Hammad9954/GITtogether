import express from 'express';
import {
  getSkillSessions,
  getAvailableSkillMentors,
  requestSession,
  respondToSession,
  completeSession,
} from '../controllers/skillShareController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/sessions', authenticate, getSkillSessions);
router.get('/mentors', authenticate, getAvailableSkillMentors);
router.post('/request', authenticate, requestSession);
router.patch('/sessions/:id/respond', authenticate, respondToSession);
router.patch('/sessions/:id/complete', authenticate, completeSession);

export default router;
