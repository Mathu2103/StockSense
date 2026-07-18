import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';
import {
  generateForecast,
  getLatestForecastRun,
  getForecastRunByMonth,
  getForecastRunDetails,
  getProductForecastDetail
} from '../controllers/aiDemandController.js';

const router = Router();

// Protect all routes: ADMIN and INVENTORY_MANAGER only
router.use(authenticate);
router.use(requireRole('ADMIN', 'INVENTORY_MANAGER'));

router.post('/forecast', generateForecast);
router.get('/forecast/latest', getLatestForecastRun);
router.get('/forecast/month/:month', getForecastRunByMonth);
router.get('/forecast/:runId', getForecastRunDetails);
router.get('/forecast/:runId/product/:sku', getProductForecastDetail);

export default router;
