"use strict";
// Main Routes Index
// This file exports all route modules in an organized manner
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const mess_1 = __importDefault(require("./mess"));
const messMembership_1 = __importDefault(require("./mess/messMembership"));
const user_1 = __importDefault(require("./user"));
const admin_1 = __importDefault(require("./admin"));
const notifications_1 = __importDefault(require("./notifications"));
const messPhoto_1 = __importDefault(require("./messPhoto"));
const mealPlan_1 = __importDefault(require("./mealPlan"));
const meals_1 = __importDefault(require("./meals"));
const paymentSettings_1 = __importDefault(require("./paymentSettings"));
const payments_1 = __importDefault(require("./payments"));
const billing_1 = __importDefault(require("./billing"));
const paymentVerification_1 = __importDefault(require("./paymentVerification"));
const feedback_1 = __importDefault(require("./feedback"));
const leaves_1 = __importDefault(require("../api/mess-owner/leaves"));
const leaveRequests_1 = __importDefault(require("./user/leaveRequests"));
const leaveBilling_1 = __importDefault(require("./leaveBilling"));
const mealActivation_1 = __importDefault(require("./mealActivation"));
const messQRVerification_1 = __importDefault(require("./messQRVerification"));
const publicMessProfile_1 = __importDefault(require("./publicMessProfile"));
const securitySettings_1 = __importDefault(require("./securitySettings"));
const chat_1 = __importDefault(require("./chat"));
const polls_1 = __importDefault(require("./polls"));
const tutorialVideos_1 = __importDefault(require("./tutorialVideos"));
const creditManagement_1 = __importDefault(require("./creditManagement"));
const messBilling_1 = __importDefault(require("./messBilling"));
const payment_1 = __importDefault(require("./payment"));
const subscriptionCheck_1 = __importDefault(require("./subscriptionCheck"));
const freeTrial_1 = __importDefault(require("./freeTrial"));
const joinRequests_1 = __importDefault(require("./joinRequests"));
const paymentRequests_1 = __importDefault(require("./paymentRequests"));
const ads_1 = __importDefault(require("./ads"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'SmartMess API is running',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0'
    });
});
// Mount all route modules
router.use('/auth', auth_1.default);
router.use('/mess', mess_1.default);
// Backward-compatible alias exposing only members endpoints under /mess-owner/members
router.use('/mess-owner/members', messMembership_1.default);
router.use('/mess-owner/leaves', leaves_1.default);
router.use('/user', user_1.default);
router.use('/user/leave-requests', leaveRequests_1.default);
router.use('/admin', admin_1.default);
router.use('/notifications', notifications_1.default);
router.use('/mess-photo', messPhoto_1.default);
// Add alias for backward compatibility - mount under /mess/photo to avoid conflicts
router.use('/mess/photo', messPhoto_1.default);
router.use('/meal-plan', mealPlan_1.default);
router.use('/meals', meals_1.default);
router.use('/payment-settings', paymentSettings_1.default);
router.use('/payments', payments_1.default);
router.use('/billing', billing_1.default);
router.use('/payment-verification', paymentVerification_1.default);
router.use('/security-settings', securitySettings_1.default);
router.use('/feedback', feedback_1.default);
router.use('/leave-billing', leaveBilling_1.default);
router.use('/meal-activation', mealActivation_1.default);
router.use('/mess-qr', messQRVerification_1.default);
router.use('/public', publicMessProfile_1.default); // Public routes (no auth required)
router.use('/chat', chat_1.default);
router.use('/polls', polls_1.default);
router.use('/tutorial-videos', tutorialVideos_1.default);
router.use('/credit-management', creditManagement_1.default);
router.use('/mess-billing', messBilling_1.default);
router.use('/razorpay', payment_1.default);
router.use('/subscription-check', subscriptionCheck_1.default);
router.use('/free-trial', freeTrial_1.default);
router.use('/join-requests', joinRequests_1.default);
router.use('/payment-requests', paymentRequests_1.default);
router.use('/ads', ads_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map