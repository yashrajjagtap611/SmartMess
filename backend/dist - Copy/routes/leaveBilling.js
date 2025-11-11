"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const leaveBillingService_1 = require("../services/leaveBillingService");
const router = (0, express_1.Router)();
// GET /api/leave-billing/summary/:messId - Get leave billing summary for a user
router.get('/summary/:messId', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { messId } = req.params;
        if (!messId) {
            return res.status(400).json({
                success: false,
                message: 'Mess ID is required'
            });
        }
        const result = await leaveBillingService_1.LeaveBillingService.getLeaveBillingSummary(userId, messId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error getting leave billing summary:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/leave-billing/process/:leaveId - Manually process leave billing (admin/mess-owner only)
router.post('/process/:leaveId', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { leaveId } = req.params;
        const { action } = req.body; // 'approve' or 'reject'
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can process leave billing.'
            });
        }
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "approve" or "reject"'
            });
        }
        let result;
        if (action === 'approve') {
            result = await leaveBillingService_1.LeaveBillingService.processApprovedLeave(leaveId, userId);
        }
        else {
            result = await leaveBillingService_1.LeaveBillingService.processRejectedLeave(leaveId, userId, req.body.rejectionReason);
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error processing leave billing:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
exports.default = router;
//# sourceMappingURL=leaveBilling.js.map