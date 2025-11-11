"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const qrCodeService_1 = __importDefault(require("../services/qrCodeService"));
const MealActivation_1 = __importDefault(require("../models/MealActivation"));
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const Meal_1 = __importDefault(require("../models/Meal"));
const MessMembership_1 = __importDefault(require("../models/MessMembership"));
const router = (0, express_1.Router)();
// POST /api/meal-activation/generate - Generate QR code for meal activation
router.post('/generate', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { mealId, mealType, date } = req.body;
        if (!mealId || !mealType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: mealId, mealType'
            });
        }
        // Get meal details
        const meal = await Meal_1.default.findById(mealId);
        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found'
            });
        }
        // Find user's active subscription for this meal
        const subscription = await MessMembership_1.default.findOne({
            userId,
            messId: meal.messId,
            status: 'active',
            mealPlanId: { $in: meal.associatedMealPlans }
        });
        if (!subscription) {
            return res.status(403).json({
                success: false,
                message: 'No active subscription found for this meal'
            });
        }
        // Generate QR code
        const result = await qrCodeService_1.default.generateMealQRCode({
            userId,
            messId: meal.messId,
            mealId,
            mealPlanId: subscription.mealPlanId.toString(),
            mealType,
            date: date ? new Date(date) : new Date()
        });
        return res.status(200).json({
            success: true,
            message: 'QR code generated successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to generate QR code'
        });
    }
});
// POST /api/meal-activation/scan - Scan and activate QR code (for mess owners)
router.post('/scan', requireAuth_1.default, async (req, res, _next) => {
    try {
        const scannerId = req.user.id;
        const { qrCodeData } = req.body;
        if (!qrCodeData) {
            return res.status(400).json({
                success: false,
                message: 'QR code data is required'
            });
        }
        // Verify scanner is a mess owner
        const messProfile = await MessProfile_1.default.findOne({ userId: scannerId });
        if (!messProfile) {
            return res.status(403).json({
                success: false,
                message: 'Only mess owners can scan QR codes'
            });
        }
        // Activate QR code
        const result = await qrCodeService_1.default.activateQRCode(qrCodeData, scannerId, 'mess_owner');
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                activation: result.activation,
                mealInfo: result.mealInfo
            }
        });
    }
    catch (error) {
        console.error('Error scanning QR code:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/meal-activation/user-scan - User self-scan for meal activation
router.post('/user-scan', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { qrCodeData } = req.body;
        if (!qrCodeData) {
            return res.status(400).json({
                success: false,
                message: 'QR code data is required'
            });
        }
        // Activate QR code (user self-scan)
        const result = await qrCodeService_1.default.activateQRCode(qrCodeData, userId, 'user');
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                activation: result.activation,
                mealInfo: result.mealInfo
            }
        });
    }
    catch (error) {
        console.error('Error in user scan:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/meal-activation/history - Get user's meal activation history
router.get('/history', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { limit = 50 } = req.query;
        const history = await qrCodeService_1.default.getUserMealHistory(userId, parseInt(limit));
        return res.status(200).json({
            success: true,
            message: 'Meal history retrieved successfully',
            data: history
        });
    }
    catch (error) {
        console.error('Error fetching meal history:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/meal-activation/active - Get user's active meals for today
router.get('/active', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const activeMeals = await qrCodeService_1.default.getUserActiveMeals(userId, targetDate);
        return res.status(200).json({
            success: true,
            message: 'Active meals retrieved successfully',
            data: activeMeals
        });
    }
    catch (error) {
        console.error('Error fetching active meals:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/meal-activation/stats - Get meal activation statistics (for mess owners)
router.get('/stats', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { date, mealType } = req.query;
        // Verify user is a mess owner
        const messProfile = await MessProfile_1.default.findOne({ userId });
        if (!messProfile) {
            return res.status(403).json({
                success: false,
                message: 'Only mess owners can view activation statistics'
            });
        }
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        const filter = {
            messId: messProfile._id.toString(),
            activationDate: { $gte: startOfDay, $lte: endOfDay }
        };
        if (mealType) {
            filter.mealType = mealType;
        }
        // Get activation statistics
        const totalGenerated = await MealActivation_1.default.countDocuments({
            ...filter,
            status: { $in: ['generated', 'activated', 'expired'] }
        });
        const totalActivated = await MealActivation_1.default.countDocuments({
            ...filter,
            status: 'activated'
        });
        const totalExpired = await MealActivation_1.default.countDocuments({
            ...filter,
            status: 'expired'
        });
        const pending = await MealActivation_1.default.countDocuments({
            ...filter,
            status: 'generated'
        });
        // Get breakdown by meal type
        const mealTypeStats = await MealActivation_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        mealType: '$mealType',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        return res.status(200).json({
            success: true,
            message: 'Activation statistics retrieved successfully',
            data: {
                summary: {
                    totalGenerated,
                    totalActivated,
                    totalExpired,
                    pending,
                    activationRate: totalGenerated > 0 ? (totalActivated / totalGenerated * 100).toFixed(2) : 0
                },
                mealTypeBreakdown: mealTypeStats
            }
        });
    }
    catch (error) {
        console.error('Error fetching activation stats:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/meal-activation/today-meals - Get today's available meals for QR generation
router.get('/today-meals', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        // Get user's active subscriptions
        const subscriptions = await MessMembership_1.default.find({
            userId,
            status: 'active'
        }).populate([
            { path: 'mealPlanId', select: 'name' },
            { path: 'messId', select: 'name' }
        ]);
        if (!subscriptions.length) {
            return res.status(200).json({
                success: true,
                message: 'No active subscriptions found',
                data: []
            });
        }
        // Get available meals for today
        const messIds = subscriptions.map(sub => sub.messId._id.toString());
        const mealPlanIds = subscriptions.map(sub => sub.mealPlanId._id.toString());
        const meals = await Meal_1.default.find({
            messId: { $in: messIds },
            date: { $gte: startOfDay, $lte: endOfDay },
            isAvailable: true,
            associatedMealPlans: { $in: mealPlanIds }
        }).populate([
            { path: 'messId', model: 'MessProfile', select: 'name' }
        ]);
        // Check which meals already have QR codes generated
        const existingActivations = await MealActivation_1.default.find({
            userId,
            activationDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['generated', 'activated'] }
        });
        const activatedMealIds = new Set(existingActivations.map(a => a.mealId));
        const availableMeals = meals.map(meal => ({
            id: meal._id,
            name: meal.name,
            description: meal.description,
            type: meal.type,
            category: meal.category,
            categories: meal.categories,
            imageUrl: meal.imageUrl,
            messName: meal.messId.name,
            hasQRCode: activatedMealIds.has(meal._id.toString()),
            canGenerate: !activatedMealIds.has(meal._id.toString())
        }));
        return res.status(200).json({
            success: true,
            message: 'Available meals retrieved successfully',
            data: availableMeals
        });
    }
    catch (error) {
        console.error('Error fetching today\'s meals:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
exports.default = router;
//# sourceMappingURL=mealActivation.js.map