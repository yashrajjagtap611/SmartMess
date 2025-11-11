"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messBillingController_1 = require("../controllers/messBillingController");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(middleware_1.auth);
// Get billing details for a specific mess (dashboard)
router.get('/:messId/details', messBillingController_1.messBillingController.getMessBillingDetails);
// Toggle auto-renewal for a specific mess
router.put('/:messId/toggle-auto-renewal', messBillingController_1.messBillingController.toggleMessAutoRenewal);
// Process monthly bill for a specific mess
router.post('/:messId/process-bill', messBillingController_1.messBillingController.processMessMonthlyBill);
// Check credits for user addition
router.get('/:messId/check-user-addition-credits', messBillingController_1.messBillingController.checkMessCreditsForUserAddition);
// Get credit usage report
router.get('/:messId/credit-usage-report', messBillingController_1.messBillingController.getMessCreditUsageReport);
// Get billing history
router.get('/:messId/billing-history', messBillingController_1.messBillingController.getMessBillingHistory);
// Get my credits details (includes low credit warning, next bill preview)
router.get('/my/credits', messBillingController_1.messBillingController.getMyCreditsDetails);
// Get bill preview
router.get('/my/bill/preview', messBillingController_1.messBillingController.getMyBillPreview);
// Generate pending bill
router.post('/my/bill/generate', messBillingController_1.messBillingController.generateMyPendingBill);
// Pay pending bill
router.post('/my/bill/pay', messBillingController_1.messBillingController.payMyPendingBill);
// Toggle auto-renewal
router.put('/my/auto-renewal', messBillingController_1.messBillingController.toggleAutoRenewal);
// Check credits for new user
router.get('/my/check-credits/new-user', messBillingController_1.messBillingController.checkCreditsForNewUser);
// Get billing history
router.get('/my/history', messBillingController_1.messBillingController.getMyBillingHistory);
// Get credit usage report
router.get('/my/usage-report', messBillingController_1.messBillingController.getMyCreditUsageReport);
// Check low credits
router.get('/my/check-low-credits', messBillingController_1.messBillingController.checkMyLowCredits);
exports.default = router;
//# sourceMappingURL=messBilling.js.map