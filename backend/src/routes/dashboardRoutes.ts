import { Router } from 'express';
import { getAdminDashboardMetrics } from '../controllers/dashboardController.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/admin', authenticate, requireRole('ADMIN'), getAdminDashboardMetrics);

export default router;
