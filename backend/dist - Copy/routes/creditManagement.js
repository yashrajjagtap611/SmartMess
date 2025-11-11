"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creditManagementController_1 = require("../controllers/creditManagementController");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// Credit Slab Routes (Admin only)
router.post('/slabs', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.createCreditSlab);
router.get('/slabs', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.getCreditSlabs);
router.put('/slabs/:slabId', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.updateCreditSlab);
router.delete('/slabs/:slabId', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.deleteCreditSlab);
// Credit Purchase Plan Routes (Admin only)
router.post('/plans', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.createCreditPurchasePlan);
router.get('/plans', middleware_1.auth, creditManagementController_1.creditManagementController.getCreditPurchasePlans);
router.put('/plans/:planId', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.updateCreditPurchasePlan);
router.delete('/plans/:planId', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.deleteCreditPurchasePlan);
// Mess Credits Routes
router.get('/mess/:messId', middleware_1.auth, creditManagementController_1.creditManagementController.getMessCredits);
router.post('/mess/:messId/purchase', middleware_1.auth, creditManagementController_1.creditManagementController.purchaseCredits);
router.post('/mess/:messId/adjust', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.adjustCredits);
// Free Trial Routes
router.get('/trial/settings', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.getFreeTrialSettings);
router.put('/trial/settings', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.updateFreeTrialSettings);
router.post('/mess/:messId/trial/activate', middleware_1.auth, creditManagementController_1.creditManagementController.activateFreeTrial);
// Monthly Billing Automation removed (no bulk processing)
// Reports and Analytics Routes (Admin only)
router.get('/transactions', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.getCreditTransactions);
router.get('/analytics', middleware_1.auth, middleware_1.requireAdmin, creditManagementController_1.creditManagementController.getCreditAnalytics);
exports.default = router;
//# sourceMappingURL=creditManagement.js.map