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
const CreditPurchasePlanSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    baseCredits: {
        type: Number,
        required: true,
        min: 1
    },
    bonusCredits: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCredits: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    features: [{
            type: String,
            trim: true
        }],
    validityDays: {
        type: Number,
        min: 1,
        default: null
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
// Ensure totalCredits is set before validation so required validation passes
CreditPurchasePlanSchema.pre('validate', function (next) {
    // @ts-ignore accessing document fields
    const base = this.baseCredits || 0;
    // @ts-ignore accessing document fields
    const bonus = this.bonusCredits || 0;
    // @ts-ignore assigning computed field before validation
    this.totalCredits = base + bonus;
    next();
});
// Index for efficient queries
CreditPurchasePlanSchema.index({ isActive: 1, price: 1 });
CreditPurchasePlanSchema.index({ isPopular: 1 });
// Static method to get active plans
CreditPurchasePlanSchema.statics.getActivePlans = function () {
    return this.find({ isActive: true }).sort({ price: 1 });
};
// Static method to get popular plans
CreditPurchasePlanSchema.statics.getPopularPlans = function () {
    return this.find({ isActive: true, isPopular: true }).sort({ price: 1 });
};
exports.default = mongoose_1.default.model('CreditPurchasePlan', CreditPurchasePlanSchema);
//# sourceMappingURL=CreditPurchasePlan.js.map