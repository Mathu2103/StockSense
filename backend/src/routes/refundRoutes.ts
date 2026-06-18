import { Router } from 'express';
import { createRefund, getRefundHistory } from '../controllers/refundController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createRefund);
router.get('/history', getRefundHistory);

export default router;
