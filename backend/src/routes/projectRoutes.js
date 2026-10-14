import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  uploadProjectBanner,
} from '../controllers/projectController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import { validateRequest } from '../middleware/validation.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidator.js';

const router = express.Router();

router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', authenticate, validateRequest(createProjectSchema), createProject);
router.put('/:id', authenticate, validateRequest(updateProjectSchema), updateProject);
router.patch('/:id/status', authenticate, updateProjectStatus);
router.delete('/:id', authenticate, deleteProject);
router.post('/:id/banner', authenticate, uploadAvatar.single('banner'), uploadProjectBanner);

export default router;
