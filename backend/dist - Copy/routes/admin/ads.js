"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAdController_1 = require("../../controllers/adminAdController");
const requireAuth_1 = __importDefault(require("../../middleware/requireAuth"));
const admin_1 = require("../../middleware/admin");
const security_1 = require("../../middleware/security");
const router = (0, express_1.Router)();
// All routes require admin authentication
router.use(requireAuth_1.default);
router.use(admin_1.requireAdmin);
router.use(security_1.generalRateLimiter);
// Settings
router.get('/settings', adminAdController_1.AdminAdController.getSettings);
router.put('/settings', adminAdController_1.AdminAdController.updateSettings);
// Campaign management
router.get('/campaigns', adminAdController_1.AdminAdController.getAllCampaigns);
router.post('/campaigns/:campaignId/approve', adminAdController_1.AdminAdController.approveCampaign);
router.post('/campaigns/:campaignId/reject', adminAdController_1.AdminAdController.rejectCampaign);
// Analytics
router.get('/analytics', adminAdController_1.AdminAdController.getAnalytics);
exports.default = router;
//# sourceMappingURL=ads.js.map