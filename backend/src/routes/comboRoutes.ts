import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';
import {
  runComboAnalysis,
  getComboAnalysisStatus,
  getOpportunities,
  getOpportunityDetails,
  ignoreOpportunity,
  getSuggestions,
  getSuggestionDetails,
  generateSuggestions,
  convertToDraft,
  createComboDraft,
  getCombosList,
  getComboDetails,
  updateComboDraft,
  submitComboForApproval,
  approveCombo,
  rejectCombo,
  requestComboChanges,
  activateCombo,
  pauseCombo,
  cancelCombo,
  getPublicActiveCombos,
  getPosActiveCombos,
  getComboPerformanceSummary,
  getSingleComboPerformance,
  deleteCombo
} from '../controllers/comboController.js';

const router = Router();

// ══════════════════════════════════════════════
// PUBLIC ROUTE (No Auth Required)
// ══════════════════════════════════════════════
router.get('/public/combos', getPublicActiveCombos);

// Protect all routes below with Authentication
router.use(authenticate);

// ══════════════════════════════════════════════
// CASHIER / POS SPECIFIC ROUTE
// ══════════════════════════════════════════════
router.get('/pos/active-combos', requireRole('ADMIN', 'CASHIER', 'INVENTORY_MANAGER'), getPosActiveCombos);

// ══════════════════════════════════════════════
// INVENTORY MANAGER & ADMIN ROUTES
// ══════════════════════════════════════════════
const managerOrAdmin = requireRole('ADMIN', 'INVENTORY_MANAGER');

router.post('/combo-analysis/run', managerOrAdmin, runComboAnalysis);
router.get('/combo-analysis/runs/:id', managerOrAdmin, getComboAnalysisStatus);

router.get('/combo-opportunities', managerOrAdmin, getOpportunities);
router.get('/combo-opportunities/:id', managerOrAdmin, getOpportunityDetails);
router.post('/combo-opportunities/:id/ignore', managerOrAdmin, ignoreOpportunity);

router.get('/combo-suggestions', managerOrAdmin, getSuggestions);
router.get('/combo-suggestions/:id', managerOrAdmin, getSuggestionDetails);
router.post('/combo-suggestions/generate/:id', managerOrAdmin, generateSuggestions);

router.get('/combo-performance', managerOrAdmin, getComboPerformanceSummary);
router.get('/combo-performance/:comboId', managerOrAdmin, getSingleComboPerformance);

// End of combo routes configurations
router.get('/combos', managerOrAdmin, getCombosList);
router.get('/combos/:id', managerOrAdmin, getComboDetails);

// Actions limited strictly to Inventory Manager (Drafting, Editing, Submitting)
router.post('/combo-suggestions/:id/convert-to-draft', requireRole('INVENTORY_MANAGER'), convertToDraft);
router.post('/combos', requireRole('INVENTORY_MANAGER'), createComboDraft);
router.patch('/combos/:id', requireRole('INVENTORY_MANAGER'), updateComboDraft);
router.post('/combos/:id/submit', requireRole('INVENTORY_MANAGER'), submitComboForApproval);

// Actions limited strictly to Administrators (Approve, Reject, Request Revisions)
router.post('/combos/:id/approve', requireRole('ADMIN'), approveCombo);
router.post('/combos/:id/reject', requireRole('ADMIN'), rejectCombo);
router.post('/combos/:id/request-changes', requireRole('ADMIN'), requestComboChanges);

// Combined Operations (Activating, Pausing, Cancelling, Deleting)
router.post('/combos/:id/activate', managerOrAdmin, activateCombo);
router.post('/combos/:id/pause', managerOrAdmin, pauseCombo);
router.post('/combos/:id/cancel', managerOrAdmin, cancelCombo);
router.delete('/combos/:id', managerOrAdmin, deleteCombo);

export default router;

// Cache refresh comment
