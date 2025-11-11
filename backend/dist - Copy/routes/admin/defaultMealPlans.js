"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../../middleware/requireAuth"));
const errorHandler_1 = require("../../middleware/errorHandler");
const User_1 = __importDefault(require("../../models/User"));
const DefaultMealPlan_1 = __importDefault(require("../../models/DefaultMealPlan"));
const MealPlan_1 = __importDefault(require("../../models/MealPlan"));
const MessProfile_1 = __importDefault(require("../../models/MessProfile"));
const router = (0, express_1.Router)();
// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        return next();
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
};
// GET /api/admin/default-meal-plans - Get all default meal plans
router.get('/', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const defaultMealPlans = await DefaultMealPlan_1.default.find()
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: 'Default meal plans retrieved successfully',
            data: defaultMealPlans
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/admin/default-meal-plans/:id - Get specific default meal plan
router.get('/:id', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const defaultMealPlan = await DefaultMealPlan_1.default.findById(id)
            .populate('createdBy', 'firstName lastName email');
        if (!defaultMealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Default meal plan not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Default meal plan retrieved successfully',
            data: defaultMealPlan
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/admin/default-meal-plans - Create new default meal plan
router.post('/', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const mealPlanData = req.body;
        const userId = req.user.id;
        // Validate required fields
        if (!mealPlanData.name || !mealPlanData.pricing || !mealPlanData.mealType || !mealPlanData.description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, pricing, mealType, description'
            });
        }
        const newDefaultMealPlan = new DefaultMealPlan_1.default({
            ...mealPlanData,
            createdBy: userId,
            isDefault: true
        });
        const savedMealPlan = await newDefaultMealPlan.save();
        const populatedMealPlan = await DefaultMealPlan_1.default.findById(savedMealPlan._id)
            .populate('createdBy', 'firstName lastName email');
        return res.status(201).json({
            success: true,
            message: 'Default meal plan created successfully',
            data: populatedMealPlan
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// PUT /api/admin/default-meal-plans/:id - Update default meal plan
router.put('/:id', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedMealPlan = await DefaultMealPlan_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('createdBy', 'firstName lastName email');
        if (!updatedMealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Default meal plan not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Default meal plan updated successfully',
            data: updatedMealPlan
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/admin/default-meal-plans/generate/:messId - Generate meal plans for specific mess
router.post('/generate/:messId', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { messId } = req.params;
        // Check if mess profile exists
        const messProfile = await MessProfile_1.default.findById(messId);
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found'
            });
        }
        // Get all active default meal plans
        const defaultMealPlans = await DefaultMealPlan_1.default.find({ isActive: true });
        if (defaultMealPlans.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active default meal plans found'
            });
        }
        // Generate meal plans for this mess
        const generatedMealPlans = [];
        for (const defaultPlan of defaultMealPlans) {
            const newMealPlan = new MealPlan_1.default({
                messId: messId,
                name: defaultPlan.name,
                pricing: defaultPlan.pricing,
                mealType: defaultPlan.mealType,
                mealsPerDay: defaultPlan.mealsPerDay,
                mealOptions: defaultPlan.mealOptions,
                description: defaultPlan.description,
                isActive: defaultPlan.isActive,
                leaveRules: defaultPlan.leaveRules
            });
            const savedMealPlan = await newMealPlan.save();
            generatedMealPlans.push(savedMealPlan);
        }
        return res.status(201).json({
            success: true,
            message: `Generated ${generatedMealPlans.length} meal plans for mess`,
            data: generatedMealPlans
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/admin/default-meal-plans/generate-all - Generate meal plans for all messes
router.post('/generate-all', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        // Get all active default meal plans
        const defaultMealPlans = await DefaultMealPlan_1.default.find({ isActive: true });
        if (defaultMealPlans.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active default meal plans found'
            });
        }
        // Get all mess profiles
        const messProfiles = await MessProfile_1.default.find();
        if (messProfiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No mess profiles found'
            });
        }
        let totalGenerated = 0;
        const results = [];
        for (const messProfile of messProfiles) {
            const messResults = [];
            for (const defaultPlan of defaultMealPlans) {
                // Check if meal plan already exists for this mess
                const existingMealPlan = await MealPlan_1.default.findOne({
                    messId: messProfile._id.toString(),
                    name: defaultPlan.name
                });
                if (!existingMealPlan) {
                    const newMealPlan = new MealPlan_1.default({
                        messId: messProfile._id.toString(),
                        name: defaultPlan.name,
                        pricing: defaultPlan.pricing,
                        mealType: defaultPlan.mealType,
                        mealsPerDay: defaultPlan.mealsPerDay,
                        mealOptions: defaultPlan.mealOptions,
                        description: defaultPlan.description,
                        isActive: defaultPlan.isActive,
                        leaveRules: defaultPlan.leaveRules
                    });
                    const savedMealPlan = await newMealPlan.save();
                    messResults.push(savedMealPlan);
                    totalGenerated++;
                }
            }
            if (messResults.length > 0) {
                results.push({
                    messId: messProfile._id,
                    messName: messProfile.name,
                    generatedPlans: messResults.length,
                    plans: messResults
                });
            }
        }
        return res.status(200).json({
            success: true,
            message: `Generated ${totalGenerated} meal plans across ${results.length} messes`,
            data: {
                totalGenerated,
                messesProcessed: results.length,
                results
            }
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// DELETE /api/admin/default-meal-plans/:id - Delete default meal plan
router.delete('/:id', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedMealPlan = await DefaultMealPlan_1.default.findByIdAndDelete(id);
        if (!deletedMealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Default meal plan not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Default meal plan deleted successfully'
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=defaultMealPlans.js.map