"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditManagementController = exports.CreditManagementController = void 0;
const creditManagementService_1 = require("../services/creditManagementService");
const models_1 = require("../models");
class CreditManagementController {
    // Credit Slab Management
    async createCreditSlab(req, res) {
        try {
            const { minUsers, maxUsers, creditsPerUser } = req.body;
            const createdBy = req.user?.id;
            if (!createdBy) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const slab = await creditManagementService_1.creditManagementService.createCreditSlab({
                minUsers,
                maxUsers,
                creditsPerUser,
                createdBy: createdBy
            });
            return res.status(201).json({
                success: true,
                data: slab,
                message: 'Credit slab created successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create credit slab'
            });
        }
    }
    async getCreditSlabs(req, res) {
        try {
            const { isActive } = req.query;
            const filters = {};
            if (isActive !== undefined) {
                filters.isActive = isActive === 'true';
            }
            const slabs = await creditManagementService_1.creditManagementService.getCreditSlabs(filters);
            return res.json({
                success: true,
                data: slabs
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch credit slabs'
            });
        }
    }
    async updateCreditSlab(req, res) {
        try {
            const { slabId } = req.params;
            const updatedBy = req.user?.id;
            if (!updatedBy) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const slab = await creditManagementService_1.creditManagementService.updateCreditSlab(slabId, {
                ...req.body,
                updatedBy: updatedBy
            });
            return res.json({
                success: true,
                data: slab,
                message: 'Credit slab updated successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update credit slab'
            });
        }
    }
    async deleteCreditSlab(req, res) {
        try {
            const { slabId } = req.params;
            const response = await creditManagementService_1.creditManagementService.deleteCreditSlab(slabId);
            return res.json({
                success: true,
                data: response,
                message: 'Credit slab deleted successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete credit slab'
            });
        }
    }
    // Credit Purchase Plan Management
    async createCreditPurchasePlan(req, res) {
        try {
            const createdBy = req.user?.id;
            if (!createdBy) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const plan = await creditManagementService_1.creditManagementService.createCreditPurchasePlan({
                ...req.body,
                createdBy: createdBy
            });
            return res.status(201).json({
                success: true,
                data: plan,
                message: 'Credit purchase plan created successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create credit purchase plan'
            });
        }
    }
    async getCreditPurchasePlans(req, res) {
        try {
            const { isActive, isPopular } = req.query;
            const filters = {};
            if (isActive !== undefined) {
                filters.isActive = isActive === 'true';
            }
            if (isPopular !== undefined) {
                filters.isPopular = isPopular === 'true';
            }
            const plans = await creditManagementService_1.creditManagementService.getCreditPurchasePlans(filters);
            return res.json({
                success: true,
                data: plans
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch credit purchase plans'
            });
        }
    }
    async updateCreditPurchasePlan(req, res) {
        try {
            const { planId } = req.params;
            const updatedBy = req.user?.id;
            if (!updatedBy) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const plan = await creditManagementService_1.creditManagementService.updateCreditPurchasePlan(planId, {
                ...req.body,
                updatedBy: updatedBy
            });
            return res.json({
                success: true,
                data: plan,
                message: 'Credit purchase plan updated successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update credit purchase plan'
            });
        }
    }
    async deleteCreditPurchasePlan(req, res) {
        try {
            const { planId } = req.params;
            const response = await creditManagementService_1.creditManagementService.deleteCreditPurchasePlan(planId);
            return res.json({
                success: true,
                data: response,
                message: 'Credit purchase plan deleted successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete credit purchase plan'
            });
        }
    }
    // Mess Credits Management
    async getMessCredits(req, res) {
        try {
            const { messId } = req.params;
            const details = await creditManagementService_1.creditManagementService.getMessCreditsDetails(messId);
            if (!details) {
                return res.status(404).json({
                    success: false,
                    message: 'Mess credits not found'
                });
            }
            return res.json({
                success: true,
                data: details
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch mess credits'
            });
        }
    }
    async purchaseCredits(req, res) {
        try {
            const { messId } = req.params;
            const { planId, paymentReference } = req.body;
            const messCredits = await creditManagementService_1.creditManagementService.purchaseCredits(messId, planId, paymentReference);
            return res.json({
                success: true,
                data: messCredits,
                message: 'Credits purchased successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to purchase credits'
            });
        }
    }
    async adjustCredits(req, res) {
        try {
            const { messId } = req.params;
            const { amount, description } = req.body;
            const processedBy = req.user?.id;
            if (!processedBy) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const messCredits = await creditManagementService_1.creditManagementService.adjustCredits(messId, amount, description, processedBy);
            return res.json({
                success: true,
                data: messCredits,
                message: 'Credits adjusted successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to adjust credits'
            });
        }
    }
    // Free Trial Management
    async getFreeTrialSettings(req, res) {
        try {
            const settings = await creditManagementService_1.creditManagementService.getFreeTrialSettings();
            return res.json({
                success: true,
                data: settings
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch free trial settings'
            });
        }
    }
    async updateFreeTrialSettings(req, res) {
        try {
            const updatedBy = req.user?.id;
            if (!updatedBy) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const settings = await creditManagementService_1.creditManagementService.updateFreeTrialSettings(req.body, updatedBy);
            return res.json({
                success: true,
                data: settings,
                message: 'Free trial settings updated successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update free trial settings'
            });
        }
    }
    async activateFreeTrial(req, res) {
        try {
            const { messId } = req.params;
            const messCredits = await creditManagementService_1.creditManagementService.activateFreeTrial(messId);
            return res.json({
                success: true,
                data: messCredits,
                message: 'Free trial activated successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to activate free trial'
            });
        }
    }
    // Monthly Billing Automation removed
    // Reports and Analytics
    async getCreditTransactions(req, res) {
        try {
            const { messId, type, status, page = 1, limit = 50 } = req.query;
            const filters = {};
            if (messId)
                filters.messId = messId;
            if (type)
                filters.type = type;
            if (status)
                filters.status = status;
            const skip = (Number(page) - 1) * Number(limit);
            const transactions = await models_1.CreditTransaction.find(filters)
                .populate('messId', 'name')
                .populate('planId', 'name baseCredits bonusCredits price')
                .populate('processedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit));
            const total = await models_1.CreditTransaction.countDocuments(filters);
            return res.json({
                success: true,
                data: {
                    transactions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch credit transactions'
            });
        }
    }
    async getCreditAnalytics(req, res) {
        try {
            const { startDate, endDate, messId } = req.query;
            const matchQuery = {};
            if (startDate && endDate) {
                matchQuery.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (messId) {
                matchQuery.messId = messId;
            }
            const analytics = await models_1.CreditTransaction.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$type',
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ]);
            return res.json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch credit analytics'
            });
        }
    }
}
exports.CreditManagementController = CreditManagementController;
exports.creditManagementController = new CreditManagementController();
//# sourceMappingURL=creditManagementController.js.map