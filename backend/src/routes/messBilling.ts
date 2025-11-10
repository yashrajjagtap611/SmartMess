import express from 'express';
import { messBillingController } from '../controllers/messBillingController';
import { auth } from '../middleware';

const router: express.Router = express.Router();

// All routes require authentication
router.use(auth);

// Get billing details for a specific mess (dashboard)
router.get('/:messId/details',
  messBillingController.getMessBillingDetails
);

// Toggle auto-renewal for a specific mess
router.put('/:messId/toggle-auto-renewal',
  messBillingController.toggleMessAutoRenewal
);

// Process monthly bill for a specific mess
router.post('/:messId/process-bill',
  messBillingController.processMessMonthlyBill
);

// Check credits for user addition
router.get('/:messId/check-user-addition-credits',
  messBillingController.checkMessCreditsForUserAddition
);

// Get credit usage report
router.get('/:messId/credit-usage-report',
  messBillingController.getMessCreditUsageReport
);

// Get billing history
router.get('/:messId/billing-history',
  messBillingController.getMessBillingHistory
);

// Get my credits details (includes low credit warning, next bill preview)
router.get('/my/credits',
  messBillingController.getMyCreditsDetails
);

// Get bill preview
router.get('/my/bill/preview',
  messBillingController.getMyBillPreview
);

// Generate pending bill
router.post('/my/bill/generate',
  messBillingController.generateMyPendingBill
);

// Pay pending bill
router.post('/my/bill/pay',
  messBillingController.payMyPendingBill
);

// Toggle auto-renewal
router.put('/my/auto-renewal',
  messBillingController.toggleAutoRenewal
);

// Check credits for new user
router.get('/my/check-credits/new-user',
  messBillingController.checkCreditsForNewUser
);

// Get billing history
router.get('/my/history',
  messBillingController.getMyBillingHistory
);

// Get credit usage report
router.get('/my/usage-report',
  messBillingController.getMyCreditUsageReport
);

// Check low credits
router.get('/my/check-low-credits',
  messBillingController.checkMyLowCredits
);

export default router;

