"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLeave = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SubscriptionExtensionTrackingSchema = new mongoose_1.Schema({
    mealPlanId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MealPlan', required: true },
    originalSubscriptionEndDate: { type: Date },
    newSubscriptionEndDate: { type: Date },
    extensionAppliedAt: { type: Date, default: Date.now }
}, { _id: true });
const PlanWiseBreakdownSchema = new mongoose_1.Schema({
    planId: { type: String, required: true },
    planName: { type: String },
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 },
    totalMealsMissed: { type: Number, default: 0 },
    estimatedSavings: { type: Number, default: 0 }
}, { _id: true });
const UserLeaveSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MessProfile', required: true },
    mealPlanIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'MealPlan', required: true }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    originalEndDate: { type: Date },
    mealTypes: [{ type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true }],
    reason: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'extended', 'cancelled'], default: 'pending' },
    totalMealsMissed: { type: Number, default: 0 },
    estimatedSavings: { type: Number, default: 0 },
    planWiseBreakdown: { type: [PlanWiseBreakdownSchema], default: [] },
    mealBreakdown: {
        breakfast: { type: Number, default: 0 },
        lunch: { type: Number, default: 0 },
        dinner: { type: Number, default: 0 }
    },
    extendSubscription: { type: Boolean, default: false },
    extensionMeals: { type: Number, default: 0 },
    extensionDays: { type: Number, default: 0 },
    deductionEligibleMeals: { type: Number, default: 0 },
    deductionEligibleDays: { type: Number, default: 0 },
    nonDeductionMeals: { type: Number, default: 0 },
    subscriptionExtensionTracking: { type: [SubscriptionExtensionTrackingSchema], default: [] },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    approvalRemarks: { type: String }
}, {
    timestamps: true
});
UserLeaveSchema.index({ userId: 1, messId: 1, startDate: -1 });
UserLeaveSchema.index({ messId: 1, status: 1 });
exports.UserLeave = mongoose_1.default.models.UserLeave || mongoose_1.default.model('UserLeave', UserLeaveSchema);
exports.default = exports.UserLeave;
//# sourceMappingURL=UserLeave.js.map