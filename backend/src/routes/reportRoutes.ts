import { Router } from 'express';
import { createReportLog, getReportHistory, clearReportHistory } from '../controllers/reportController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/history', createReportLog);
router.get('/history', getReportHistory);
router.delete('/history', clearReportHistory);

export default router;
