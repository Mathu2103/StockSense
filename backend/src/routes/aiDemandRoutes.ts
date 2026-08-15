import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';
import {
  generateForecast,
  getLatestForecastRun,
  getForecastRunByMonth,
  getForecastRunDetails,
  getProductForecastDetail,
  getForecastHistory
} from '../controllers/aiDemandController.js';

const router = Router();

// Protect all routes: ADMIN and INVENTORY_MANAGER only
router.use(authenticate);
router.use(requireRole('ADMIN', 'INVENTORY_MANAGER'));

router.post('/forecast', generateForecast);
router.get('/forecast/latest', getLatestForecastRun);
router.get('/forecast/month/:month', getForecastRunByMonth);
router.get('/forecast/history', getForecastHistory);

// Support both styles of run details endpoints
router.get('/forecast/:runId', getForecastRunDetails);
router.get('/forecast/run/:runId', getForecastRunDetails);
router.get('/forecast/run/:runId/products', getForecastRunDetails);

// Support single product details endpoints
router.get('/forecast/:runId/product/:sku', getProductForecastDetail);
router.get('/forecast/run/:runId/product/:sku', getProductForecastDetail);

export default router;
