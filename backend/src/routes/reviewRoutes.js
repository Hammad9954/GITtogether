import express from 'express';
import { createReview, getReviewsForUser } from '../controllers/reviewController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createReviewSchema } from '../validators/miscValidators.js';

const router = express.Router();

router.post('/', authenticate, validateRequest(createReviewSchema), createReview);
router.get('/user/:userId', optionalAuth, getReviewsForUser);

export default router;
