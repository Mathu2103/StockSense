import { Router } from 'express';
import { createBill, getSalesHistory, getDraftBills, deleteDraftBill } from '../controllers/salesController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/bill', createBill);
router.get('/history', getSalesHistory);
router.get('/drafts', getDraftBills);
router.delete('/drafts/:id', deleteDraftBill);

export default router;
