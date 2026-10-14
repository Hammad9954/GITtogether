import express from 'express';
import {
  getDashboardAnalytics,
  getAllUsersAdmin,
  toggleUserSuspension,
  updateUserRole,
  getReportsAdmin,
  resolveReportAdmin,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// Enforce admin role for all admin routes
router.use(authenticate, requireRole('admin'));

router.get('/analytics', getDashboardAnalytics);
router.get('/users', getAllUsersAdmin);
router.patch('/users/:userId/suspend', toggleUserSuspension);
router.patch('/users/:userId/role', updateUserRole);
router.get('/reports', getReportsAdmin);
router.patch('/reports/:reportId/resolve', resolveReportAdmin);

export default router;
