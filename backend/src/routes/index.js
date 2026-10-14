import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import projectRoutes from './projectRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import teamRoutes from './teamRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import hackathonRoutes from './hackathonRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import skillShareRoutes from './skillShareRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import reportRoutes from './reportRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/applications', applicationRoutes);
router.use('/teams', teamRoutes);
router.use('/matching', matchingRoutes);
router.use('/hackathons', hackathonRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/skills', skillShareRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Git Together API v1',
    tagline: 'Find your people. Build something great.',
  });
});

export default router;
