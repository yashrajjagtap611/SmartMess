"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const MealPlan_1 = __importDefault(require("../models/MealPlan"));
const router = (0, express_1.Router)();
// GET /api/public/mess/:messId - Get public mess profile with plans
router.get('/mess/:messId', async (req, res) => {
    try {
        const { messId } = req.params;
        // Get mess profile
        const messProfile = await MessProfile_1.default.findById(messId)
            .select('name location colleges types ownerPhone operatingHours logo')
            .lean();
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess not found'
            });
        }
        // Get all meal plans for this mess
        const mealPlans = await MealPlan_1.default.find({ messId, isActive: true })
            .select('name description pricing mealType mealsPerDay mealOptions')
            .lean();
        return res.status(200).json({
            success: true,
            message: 'Mess profile retrieved successfully',
            data: {
                mess: messProfile,
                plans: mealPlans
            }
        });
    }
    catch (error) {
        console.error('Error fetching public mess profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch mess profile'
        });
    }
});
exports.default = router;
//# sourceMappingURL=publicMessProfile.js.map