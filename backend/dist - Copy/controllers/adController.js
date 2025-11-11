"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdController = void 0;
const adService_1 = require("../services/adService");
const adCreditService_1 = require("../services/adCreditService");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
class AdController {
    /**
     * Get ad settings (public)
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
     * Get active ad card for current user
     */
    static async getActiveAdCard(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const adCard = await adService_1.AdService.getActiveAdCard(userId);
            res.status(200).json({
                success: true,
                data: adCard
            });
        }
        catch (error) {
            logger_1.default.error('Error getting active ad card:', error);
            next(error);
        }
    }
    /**
     * Record ad card impression
     */
    static async recordAdCardImpression(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const { campaignId } = req.body;
            if (!campaignId) {
                res.status(400).json({
                    success: false,
                    message: 'Campaign ID is required'
                });
                return;
            }
            await adService_1.AdService.recordAdCardImpression(campaignId, userId, {
                userAgent: req.headers['user-agent'],
                ip: req.ip
            });
            res.status(200).json({
                success: true,
                message: 'Impression recorded'
            });
        }
        catch (error) {
            logger_1.default.error('Error recording impression:', error);
            next(error);
        }
    }
    /**
     * Record ad card click
     */
    static async recordAdCardClick(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const { campaignId } = req.body;
            if (!campaignId) {
                res.status(400).json({
                    success: false,
                    message: 'Campaign ID is required'
                });
                return;
            }
            await adService_1.AdService.recordAdCardClick(campaignId, userId, {
                userAgent: req.headers['user-agent'],
                ip: req.ip
            });
            res.status(200).json({
                success: true,
                message: 'Click recorded'
            });
        }
        catch (error) {
            logger_1.default.error('Error recording click:', error);
            next(error);
        }
    }
    /**
     * Get ad credits balance (for mess owner)
     */
    static async getCredits(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== 'mess-owner') {
                res.status(403).json({
                    success: false,
                    message: 'Only mess owners can access ad credits'
                });
                return;
            }
            // Get messId from MessProfile (mess owners don't have messId on User model)
            const messProfile = await models_1.MessProfile.findOne({ userId: user._id });
            if (!messProfile) {
                res.status(400).json({
                    success: false,
                    message: 'Mess profile not found. Please create a mess profile first.'
                });
                return;
            }
            const messId = messProfile._id.toString();
            const credits = await adCreditService_1.AdCreditService.getCredits(messId);
            res.status(200).json({
                success: true,
                data: credits
            });
        }
        catch (error) {
            logger_1.default.error('Error getting ad credits:', error);
            next(error);
        }
    }
    /**
     * Purchase ad credits
     */
    static async purchaseCredits(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== 'mess-owner') {
                res.status(403).json({
                    success: false,
                    message: 'Only mess owners can purchase ad credits'
                });
                return;
            }
            const { amount, paymentReference } = req.body;
            if (!amount || amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Valid credit amount is required'
                });
                return;
            }
            // Get messId from MessProfile
            const messProfile = await models_1.MessProfile.findOne({ userId: user._id });
            if (!messProfile) {
                res.status(400).json({
                    success: false,
                    message: 'Mess profile not found. Please create a mess profile first.'
                });
                return;
            }
            const messId = messProfile._id.toString();
            const credits = await adCreditService_1.AdCreditService.purchaseCredits(messId, amount, paymentReference);
            res.status(200).json({
                success: true,
                data: credits,
                message: `Successfully purchased ${amount} ad credits`
            });
        }
        catch (error) {
            logger_1.default.error('Error purchasing ad credits:', error);
            next(error);
        }
    }
    /**
     * Calculate target user count for filters
     */
    static async calculateTargetUserCount(req, res, next) {
        try {
            const { audienceFilters } = req.body;
            if (!audienceFilters) {
                res.status(400).json({
                    success: false,
                    message: 'Audience filters are required'
                });
                return;
            }
            const count = await adService_1.AdService.calculateTargetUserCount(audienceFilters);
            res.status(200).json({
                success: true,
                data: { targetUserCount: count }
            });
        }
        catch (error) {
            logger_1.default.error('Error calculating target user count:', error);
            next(error);
        }
    }
    /**
     * Get audience list (name + profile photo only)
     */
    static async getAudienceList(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== 'mess-owner') {
                res.status(403).json({
                    success: false,
                    message: 'Only mess owners can view audience lists'
                });
                return;
            }
            const { audienceFilters } = req.body;
            if (!audienceFilters) {
                res.status(400).json({
                    success: false,
                    message: 'Audience filters are required'
                });
                return;
            }
            const audience = await adService_1.AdService.getAudienceList(audienceFilters);
            res.status(200).json({
                success: true,
                data: audience
            });
        }
        catch (error) {
            logger_1.default.error('Error getting audience list:', error);
            next(error);
        }
    }
    /**
     * Create ad campaign
     */
    static async createCampaign(req, res, next) {
        try {
            const user = req.user;
            // Allow both mess owners and admins to create campaigns
            if (user.role !== 'mess-owner' && user.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Only mess owners and admins can create ad campaigns'
                });
                return;
            }
            let messId;
            // For mess owners, get messId from MessProfile
            if (user.role === 'mess-owner') {
                const messProfile = await models_1.MessProfile.findOne({ userId: user._id });
                if (!messProfile) {
                    res.status(400).json({
                        success: false,
                        message: 'Mess profile not found. Please create a mess profile first.'
                    });
                    return;
                }
                messId = messProfile._id.toString();
            }
            // For admins, messId can be optional or from request body
            else if (user.role === 'admin') {
                messId = req.body.messId; // Admin can specify messId or leave it for platform-wide campaigns
            }
            const campaignData = {
                ...req.body,
                ...(messId && { messId })
            };
            const campaign = await adService_1.AdService.createCampaign(campaignData);
            res.status(201).json({
                success: true,
                data: campaign,
                message: 'Campaign created successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error creating campaign:', error);
            next(error);
        }
    }
    /**
     * Get campaigns for mess owner or admin
     */
    static async getCampaigns(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== 'mess-owner' && user.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Only mess owners and admins can view campaigns'
                });
                return;
            }
            const { status } = req.query;
            let campaigns;
            // For mess owners, get campaigns by messId
            if (user.role === 'mess-owner') {
                const messProfile = await models_1.MessProfile.findOne({ userId: user._id });
                if (!messProfile) {
                    res.status(400).json({
                        success: false,
                        message: 'Mess profile not found. Please create a mess profile first.'
                    });
                    return;
                }
                const messId = messProfile._id.toString();
                campaigns = await adService_1.AdService.getMessCampaigns(messId, status);
            }
            // For admins, get all campaigns
            else if (user.role === 'admin') {
                campaigns = await adService_1.AdService.getAllCampaigns(status);
            }
            res.status(200).json({
                success: true,
                data: campaigns
            });
        }
        catch (error) {
            logger_1.default.error('Error getting campaigns:', error);
            next(error);
        }
    }
    /**
     * Get campaign analytics
     */
    static async getCampaignAnalytics(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== 'mess-owner') {
                res.status(403).json({
                    success: false,
                    message: 'Only mess owners can view campaign analytics'
                });
                return;
            }
            const { campaignId } = req.params;
            if (!campaignId) {
                res.status(400).json({
                    success: false,
                    message: 'Campaign ID is required'
                });
                return;
            }
            const analytics = await adService_1.AdService.getCampaignAnalytics(campaignId);
            res.status(200).json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            logger_1.default.error('Error getting campaign analytics:', error);
            next(error);
        }
    }
}
exports.AdController = AdController;
//# sourceMappingURL=adController.js.map