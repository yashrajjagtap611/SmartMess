"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCanAddMeals = exports.checkCanAcceptUsers = exports.checkSubscription = void 0;
const subscriptionCheckService_1 = require("../services/subscriptionCheckService");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to check if mess has active subscription
 */
const checkSubscription = async (req, res, next) => {
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
        // Check subscription status
        const status = await subscriptionCheckService_1.subscriptionCheckService.checkSubscriptionStatus(messId);
        if (!status.isActive) {
            return res.status(403).json({
                success: false,
                subscriptionExpired: true,
                message: status.message || 'Your subscription has expired. Please renew to continue.',
                data: {
                    isTrialActive: status.isTrialActive,
                    hasCredits: status.hasCredits,
                    availableCredits: status.availableCredits
                }
            });
        }
        // Subscription is active, proceed
        return next();
    }
    catch (error) {
        logger_1.default.error('Subscription check middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify subscription'
        });
    }
};
exports.checkSubscription = checkSubscription;
/**
 * Middleware to check if mess can accept new users
 */
const checkCanAcceptUsers = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
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
        const check = await subscriptionCheckService_1.subscriptionCheckService.canAcceptNewUsers(messId);
        if (!check.allowed) {
            return res.status(403).json({
                success: false,
                subscriptionExpired: true,
                message: check.reason || 'Cannot accept new users at this time'
            });
        }
        return next();
    }
    catch (error) {
        logger_1.default.error('Check can accept users middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify permissions'
        });
    }
};
exports.checkCanAcceptUsers = checkCanAcceptUsers;
/**
 * Middleware to check if mess can add meals
 */
const checkCanAddMeals = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
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
        const check = await subscriptionCheckService_1.subscriptionCheckService.canAddMeals(messId);
        if (!check.allowed) {
            return res.status(403).json({
                success: false,
                subscriptionExpired: true,
                message: check.reason || 'Cannot add meals at this time'
            });
        }
        return next();
    }
    catch (error) {
        logger_1.default.error('Check can add meals middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify permissions'
        });
    }
};
exports.checkCanAddMeals = checkCanAddMeals;
//# sourceMappingURL=checkSubscription.js.map