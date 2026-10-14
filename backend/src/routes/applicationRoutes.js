import express from 'express';
import {
  applyToProject,
  getProjectApplications,
  getMyApplications,
  reviewApplication,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { applyProjectSchema, reviewApplicationSchema } from '../validators/applicationValidator.js';

const router = express.Router();

router.post('/project/:projectId', authenticate, validateRequest(applyProjectSchema), applyToProject);
router.get('/project/:projectId', authenticate, getProjectApplications);
router.get('/my', authenticate, getMyApplications);
router.patch('/:id/review', authenticate, validateRequest(reviewApplicationSchema), reviewApplication);
router.patch('/:id/withdraw', authenticate, withdrawApplication);

export default router;
