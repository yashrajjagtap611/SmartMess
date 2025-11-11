"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAdController = void 0;
const models_1 = require("../models");
const adService_1 = require("../services/adService");
const logger_1 = __importDefault(require("../utils/logger"));
class AdminAdController {
    /**
     * Get ad settings (admin)
     */
    static async getSettings(req, res, next) {
        try {
            const settings = await adService_1.AdService.getSettings();
            res.status(200).json({
                success: true,
                data: settings
            });
        }
        catch (error) {
            logger_1.default.error('Error getting ad settings:', error);
            next(error);
        }
    }
    /**
     * Update ad settings
     */
    static async updateSettings(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const updates = req.body;
            // Get current settings or create new
            let settings = await models_1.AdSettings.findOne().sort({ createdAt: -1 });
            if (!settings) {
                settings = await models_1.AdSettings.create({
                    ...updates,
                    updatedBy: userId
                });
            }
            else {
                Object.assign(settings, updates, { updatedBy: userId });
                await settings.save();
            }
            res.status(200).json({
                success: true,
                data: settings,
                message: 'Ad settings updated successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error updating ad settings:', error);
            next(error);
        }
    }
    /**
     * Get all campaigns (admin)
     */
    static async getAllCampaigns(req, res, next) {
        try {
            const { status, messId } = req.query;
            const query = {};
            if (status) {
                query.status = status;
            }
            if (messId) {
                query.messId = messId;
            }
            const campaigns = await models_1.AdCampaign.find(query)
                .populate('messId', 'name')
                .populate('approvedBy', 'firstName lastName')
                .sort({ createdAt: -1 });
            res.status(200).json({
                success: true,
                data: campaigns
            });
        }
        catch (error) {
            logger_1.default.error('Error getting all campaigns:', error);
            next(error);
        }
    }
    /**
     * Approve campaign
     */
    static async approveCampaign(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const { campaignId } = req.params;
            if (!campaignId) {
                res.status(400).json({
                    success: false,
                    message: 'Campaign ID is required'
                });
                return;
            }
            const campaign = await models_1.AdCampaign.findById(campaignId);
            if (!campaign) {
                res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
                return;
            }
            if (campaign.status !== 'pending_approval') {
                res.status(400).json({
                    success: false,
                    message: 'Campaign is not pending approval'
                });
                return;
            }
            // Activate the campaign
            await adService_1.AdService.activateCampaign(campaignId);
            // Update approval info
            campaign.approvedBy = userId;
            campaign.approvedAt = new Date();
            campaign.status = 'active';
            await campaign.save();
            res.status(200).json({
                success: true,
                data: campaign,
                message: 'Campaign approved and activated'
            });
        }
        catch (error) {
            logger_1.default.error('Error approving campaign:', error);
            next(error);
        }
    }
    /**
     * Reject campaign
     */
    static async rejectCampaign(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const { campaignId } = req.params;
            const { rejectionReason } = req.body;
            if (!campaignId) {
                res.status(400).json({
                    success: false,
                    message: 'Campaign ID is required'
                });
                return;
            }
            const campaign = await models_1.AdCampaign.findById(campaignId);
            if (!campaign) {
                res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
                return;
            }
            if (campaign.status !== 'pending_approval') {
                res.status(400).json({
                    success: false,
                    message: 'Campaign is not pending approval'
                });
                return;
            }
            campaign.status = 'rejected';
            campaign.rejectionReason = rejectionReason || 'Campaign rejected by admin';
            await campaign.save();
            res.status(200).json({
                success: true,
                data: campaign,
                message: 'Campaign rejected'
            });
        }
        catch (error) {
            logger_1.default.error('Error rejecting campaign:', error);
            next(error);
        }
    }
    /**
     * Get ad analytics (admin)
     */
    static async getAnalytics(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const query = {};
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) {
                    query.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.createdAt.$lte = new Date(endDate);
                }
            }
            const campaigns = await models_1.AdCampaign.find(query)
                .populate('messId', 'name')
                .sort({ createdAt: -1 });
            const totalCampaigns = campaigns.length;
            const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
            const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
            const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
            const totalCreditsUsed = campaigns.reduce((sum, c) => sum + c.creditsUsed, 0);
            res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalCampaigns,
                        activeCampaigns,
                        totalImpressions,
                        totalClicks,
                        totalCreditsUsed,
                        clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00'
                    },
                    campaigns
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error getting ad analytics:', error);
            next(error);
        }
    }
}
exports.AdminAdController = AdminAdController;
//# sourceMappingURL=adminAdController.js.map