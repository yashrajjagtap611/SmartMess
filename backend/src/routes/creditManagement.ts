import express from 'express';
import { creditManagementController } from '../controllers/creditManagementController';
import { auth, requireAdmin } from '../middleware';

const router: express.Router = express.Router();

// Credit Slab Routes (Admin only)
router.post('/slabs',
  auth,
  requireAdmin,
  creditManagementController.createCreditSlab
);

router.get('/slabs',
  auth,
  requireAdmin,
  creditManagementController.getCreditSlabs
);

router.put('/slabs/:slabId',
  auth,
  requireAdmin,
  creditManagementController.updateCreditSlab
);

router.delete('/slabs/:slabId',
  auth,
  requireAdmin,
  creditManagementController.deleteCreditSlab
);

// Credit Purchase Plan Routes (Admin only)
router.post('/plans',
  auth,
  requireAdmin,
  creditManagementController.createCreditPurchasePlan
);

router.get('/plans',
  auth,
  creditManagementController.getCreditPurchasePlans
);

router.put('/plans/:planId',
  auth,
  requireAdmin,
  creditManagementController.updateCreditPurchasePlan
);

router.delete('/plans/:planId',
  auth,
  requireAdmin,
  creditManagementController.deleteCreditPurchasePlan
);

// Mess Credits Routes
router.get('/mess/:messId',
  auth,
  creditManagementController.getMessCredits
);

router.post('/mess/:messId/purchase',
  auth,
  creditManagementController.purchaseCredits
);

router.post('/mess/:messId/adjust',
  auth,
  requireAdmin,
  creditManagementController.adjustCredits
);

// Free Trial Routes
router.get('/trial/settings',
  auth,
  requireAdmin,
  creditManagementController.getFreeTrialSettings
);

router.put('/trial/settings',
  auth,
  requireAdmin,
  creditManagementController.updateFreeTrialSettings
);

router.post('/mess/:messId/trial/activate',
  auth,
  creditManagementController.activateFreeTrial
);

// Monthly Billing Automation removed (no bulk processing)

// Reports and Analytics Routes (Admin only)
router.get('/transactions',
  auth,
  requireAdmin,
  creditManagementController.getCreditTransactions
);

router.get('/analytics',
  auth,
  requireAdmin,
  creditManagementController.getCreditAnalytics
);

export default router;
