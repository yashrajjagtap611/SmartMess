"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeTrialController = exports.FreeTrialController = void 0;
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
class FreeTrialController {
    /**
     * Activate free trial for a mess owner
     */
    async activateFreeTrial(req, res) {
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
            // Check if free trial is enabled globally
            const trialSettings = await models_1.FreeTrialSettings.findOne();
            if (!trialSettings || !trialSettings.isGloballyEnabled) {
                return res.status(400).json({
                    success: false,
                    message: 'Free trial is not currently available'
                });
            }
            // Get or create mess credits account
            let messCredits = await models_1.MessCredits.findOne({ messId });
            if (messCredits) {
                // Check if trial was already used
                if (messCredits.trialStartDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'Free trial has already been used for this mess',
                        data: {
                            trialStartDate: messCredits.trialStartDate,
                            trialEndDate: messCredits.trialEndDate,
                            isTrialActive: messCredits.isTrialActive
                        }
                    });
                }
                // Activate trial on existing account
                messCredits.isTrialActive = true;
                messCredits.trialStartDate = new Date();
                messCredits.trialEndDate = new Date(Date.now() + trialSettings.defaultTrialDurationDays * 24 * 60 * 60 * 1000);
                messCredits.status = 'trial';
                await messCredits.save();
                logger_1.default.info(`Free trial activated for existing mess ${messId}`);
            }
            else {
                // Create new credits account with trial
                messCredits = await models_1.MessCredits.create({
                    messId,
                    totalCredits: 0,
                    usedCredits: 0,
                    availableCredits: 0,
                    isTrialActive: true,
                    trialStartDate: new Date(),
                    trialEndDate: new Date(Date.now() + trialSettings.defaultTrialDurationDays * 24 * 60 * 60 * 1000),
                    trialCreditsUsed: 0,
                    monthlyUserCount: 0,
                    lastUserCountUpdate: new Date(),
                    status: 'trial',
                    autoRenewal: false,
                    lowCreditThreshold: 100
                });
                logger_1.default.info(`Free trial activated for new mess ${messId}`);
            }
            return res.json({
                success: true,
                message: `Free trial activated! You now have ${trialSettings.defaultTrialDurationDays} days of full access.`,
                data: {
                    trialStartDate: messCredits.trialStartDate,
                    trialEndDate: messCredits.trialEndDate,
                    trialDurationDays: trialSettings.defaultTrialDurationDays,
                    isTrialActive: messCredits.isTrialActive,
                    status: messCredits.status
                }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to activate free trial:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to activate free trial'
            });
        }
    }
    /**
     * Check if free trial is available for current user
     */
    async checkTrialAvailability(req, res) {
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
            // Check if free trial is enabled globally
            const trialSettings = await models_1.FreeTrialSettings.findOne();
            if (!trialSettings || !trialSettings.isGloballyEnabled) {
                return res.json({
                    success: true,
                    data: {
                        available: false,
                        reason: 'Free trial is not currently available'
                    }
                });
            }
            // Check if mess has already used trial
            const messCredits = await models_1.MessCredits.findOne({ messId });
            if (messCredits && messCredits.trialStartDate) {
                return res.json({
                    success: true,
                    data: {
                        available: false,
                        reason: 'Free trial has already been used',
                        trialStartDate: messCredits.trialStartDate,
                        trialEndDate: messCredits.trialEndDate,
                        isTrialActive: messCredits.isTrialActive
                    }
                });
            }
            // Trial is available
            return res.json({
                success: true,
                data: {
                    available: true,
                    trialDurationDays: trialSettings.defaultTrialDurationDays
                }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to check trial availability:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to check trial availability'
            });
        }
    }
}
exports.FreeTrialController = FreeTrialController;
exports.freeTrialController = new FreeTrialController();
//# sourceMappingURL=freeTrialController.js.map