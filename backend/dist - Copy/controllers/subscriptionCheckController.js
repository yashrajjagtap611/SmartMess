"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionCheckController = exports.SubscriptionCheckController = void 0;
const subscriptionCheckService_1 = require("../services/subscriptionCheckService");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
class SubscriptionCheckController {
    /**
     * Get subscription status for current mess owner
     */
    async getSubscriptionStatus(req, res) {
        try {
            const userId = req.user?.id || req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            // Get mess profile
            const messProfile = await models_1.MessProfile.findOne({ userId });
            if (!messProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Mess profile not found'
                });
            }
            const messId = messProfile._id.toString();
            // Get subscription status
            const status = await subscriptionCheckService_1.subscriptionCheckService.checkSubscriptionStatus(messId);
            return res.json({
                success: true,
                data: status
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get subscription status:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to check subscription status'
            });
        }
    }
    /**
     * Check if can access a specific module
     */
    async checkModuleAccess(req, res) {
        try {
            const userId = req.user?.id || req.user?._id;
            const { module } = req.params;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            if (!module) {
                return res.status(400).json({
                    success: false,
                    message: 'Module name is required'
                });
            }
            const messProfile = await models_1.MessProfile.findOne({ userId });
            if (!messProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Mess profile not found'
                });
            }
            const messId = messProfile._id.toString();
            const check = await subscriptionCheckService_1.subscriptionCheckService.canAccessModule(messId, module);
            return res.json({
                success: true,
                data: {
                    module,
                    allowed: check.allowed,
                    reason: check.reason
                }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to check module access:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to check module access'
            });
        }
    }
}
exports.SubscriptionCheckController = SubscriptionCheckController;
exports.subscriptionCheckController = new SubscriptionCheckController();
//# sourceMappingURL=subscriptionCheckController.js.map