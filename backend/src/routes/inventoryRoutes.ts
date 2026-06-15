import { Router } from 'express';
import { getGRNs, createGRN, getAdjustments, createAdjustment, getLedger } from '../controllers/inventoryController.js';

const router = Router();

router.get('/grns', getGRNs);
router.post('/grns', createGRN);

router.get('/adjustments', getAdjustments);
router.post('/adjustments', createAdjustment);

router.get('/ledger', getLedger);

export default router;
