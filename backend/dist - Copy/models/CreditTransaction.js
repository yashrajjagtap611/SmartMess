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
const CreditTransactionSchema = new mongoose_1.Schema({
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: true
    },
    type: {
        type: String,
        enum: ['purchase', 'deduction', 'bonus', 'refund', 'adjustment', 'trial'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    referenceId: {
        type: String,
        trim: true,
        sparse: true
    },
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CreditPurchasePlan',
        default: null
    },
    billingPeriod: {
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        }
    },
    userCount: {
        type: Number,
        min: 0,
        default: null
    },
    creditsPerUser: {
        type: Number,
        min: 0,
        default: null
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    processedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});
// Indexes for efficient queries
CreditTransactionSchema.index({ messId: 1, createdAt: -1 });
CreditTransactionSchema.index({ type: 1, status: 1 });
CreditTransactionSchema.index({ referenceId: 1 });
CreditTransactionSchema.index({ createdAt: -1 });
// Static methods
CreditTransactionSchema.statics.findByMessId = function (messId, limit = 50) {
    return this.find({ messId })
        .populate('planId', 'name baseCredits bonusCredits price')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);
};
CreditTransactionSchema.statics.getMonthlyStats = function (messId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return this.aggregate([
        {
            $match: {
                messId: new mongoose_1.default.Types.ObjectId(messId),
                createdAt: { $gte: startDate, $lte: endDate },
                status: 'completed'
            }
        },
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
};
CreditTransactionSchema.statics.createPurchaseTransaction = function (data) {
    return this.create({
        messId: data.messId,
        planId: data.planId,
        type: 'purchase',
        amount: data.amount,
        description: `Credit purchase - Plan ID: ${data.planId}`,
        referenceId: data.referenceId,
        processedBy: data.processedBy,
        status: 'completed'
    });
};
CreditTransactionSchema.statics.createBillingTransaction = function (data) {
    return this.create({
        messId: data.messId,
        type: 'deduction',
        amount: -Math.abs(data.amount),
        description: `Monthly billing for ${data.userCount} users at ${data.creditsPerUser} credits/user`,
        userCount: data.userCount,
        creditsPerUser: data.creditsPerUser,
        billingPeriod: data.billingPeriod,
        status: 'completed'
    });
};
exports.default = mongoose_1.default.model('CreditTransaction', CreditTransactionSchema);
//# sourceMappingURL=CreditTransaction.js.map