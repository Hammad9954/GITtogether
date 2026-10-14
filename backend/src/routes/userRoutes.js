import express from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
} from '../controllers/userController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import { validateRequest } from '../middleware/validation.js';
import { updateProfileSchema } from '../validators/authValidator.js';

const router = express.Router();

router.get('/', optionalAuth, getUsers);
router.get('/:id', optionalAuth, getUserById);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), updateAvatar);

export default router;
