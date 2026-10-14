import express from 'express';
import { createReport, getMyReports } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createReportSchema } from '../validators/miscValidators.js';

const router = express.Router();

router.post('/', authenticate, validateRequest(createReportSchema), createReport);
router.get('/my', authenticate, getMyReports);

export default router;
