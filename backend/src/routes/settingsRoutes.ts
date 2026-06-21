import express from 'express';
import { getSettings, updateSettings, applyStockRulesToAllProducts } from '../controllers/settingsController.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/apply-stock-rules', authenticate, requireRole('ADMIN', 'INVENTORY_MANAGER'), applyStockRulesToAllProducts);
router.get('/:key', authenticate, requireRole('ADMIN', 'INVENTORY_MANAGER'), getSettings);
router.put('/:key', authenticate, requireRole('ADMIN', 'INVENTORY_MANAGER'), updateSettings);

export default router;
