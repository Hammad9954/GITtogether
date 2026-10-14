import express from 'express';
import {
  getRecommendedProjects,
  getRecommendedStudents,
  compareStudentToProject,
} from '../controllers/matchingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/projects', authenticate, getRecommendedProjects);
router.get('/students', authenticate, getRecommendedStudents);
router.get('/compare/:studentId/:projectId', authenticate, compareStudentToProject);

export default router;
