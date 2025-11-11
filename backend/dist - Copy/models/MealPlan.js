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
const mongoose_1 = __importStar(require("mongoose"));
const MealPlanSchema = new mongoose_1.Schema({
    messId: {
        type: String,
        required: true,
        ref: 'MessProfile'
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    pricing: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        period: {
            type: String,
            required: true,
            enum: ['day', 'week', '15days', 'month', '3months', '6months', 'year'],
            default: 'month'
        }
    },
    mealType: {
        type: String,
        required: true,
        enum: ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Custom', 'Vegan']
    },
    mealsPerDay: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        default: 3
    },
    mealOptions: {
        breakfast: {
            type: Boolean,
            default: true
        },
        lunch: {
            type: Boolean,
            default: true
        },
        dinner: {
            type: Boolean,
            default: true
        }
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },
    isActive: {
        type: Boolean,
        default: true
    },
    leaveRules: {
        maxLeaveMeals: {
            type: Number,
            required: true,
            min: 1,
            max: 93,
            default: 30
        },
        requireTwoHourNotice: {
            type: Boolean,
            default: true
        },
        noticeHours: {
            type: Number,
            required: true,
            min: 1,
            max: 24,
            default: 2
        },
        minConsecutiveDays: {
            type: Number,
            required: true,
            min: 1,
            max: 31,
            default: 2
        },
        extendSubscription: {
            type: Boolean,
            default: true
        },
        autoApproval: {
            type: Boolean,
            default: true
        },
        leaveLimitsEnabled: {
            type: Boolean,
            default: true
        },
        consecutiveLeaveEnabled: {
            type: Boolean,
            default: true
        },
        maxLeaveMealsEnabled: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});
// Index for efficient queries
MealPlanSchema.index({ messId: 1, isActive: 1 });
MealPlanSchema.index({ messId: 1, createdAt: -1 });
exports.default = mongoose_1.default.model('MealPlan', MealPlanSchema);
//# sourceMappingURL=MealPlan.js.map