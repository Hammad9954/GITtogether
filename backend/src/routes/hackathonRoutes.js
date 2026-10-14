import express from 'express';
import {
  getHackathons,
  getHackathonById,
  createHackathon,
  joinHackathon,
  registerTeamToHackathon,
} from '../controllers/hackathonController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createHackathonSchema } from '../validators/miscValidators.js';

const router = express.Router();

router.get('/', optionalAuth, getHackathons);
router.get('/:id', optionalAuth, getHackathonById);
router.post('/', authenticate, validateRequest(createHackathonSchema), createHackathon);
router.post('/:id/join', authenticate, joinHackathon);
router.post('/:id/register-team', authenticate, registerTeamToHackathon);

export default router;
