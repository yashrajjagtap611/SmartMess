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
const BillingSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: true,
        index: true
    },
    membershipId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessMembership',
        required: true,
        index: true
    },
    billingPeriod: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        period: {
            type: String,
            enum: ['daily', 'weekly', '15days', 'monthly', '3months', '6months', 'yearly'],
            required: true
        }
    },
    subscription: {
        planId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'MealPlan',
            required: true
        },
        planName: {
            type: String,
            required: true
        },
        baseAmount: {
            type: Number,
            required: true,
            min: 0
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        taxAmount: {
            type: Number,
            required: true,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'overdue', 'refunded', 'cancelled'],
            default: 'pending',
            required: true,
            index: true
        },
        method: {
            type: String,
            enum: ['upi', 'online', 'cash', 'bank_transfer', 'cheque']
        },
        dueDate: {
            type: Date,
            required: true,
            index: true
        },
        paidDate: {
            type: Date
        },
        transactionId: {
            type: String,
            index: true
        },
        gatewayResponse: {
            type: mongoose_1.Schema.Types.Mixed
        }
    },
    adjustments: [{
            type: {
                type: String,
                enum: ['discount', 'penalty', 'leave_credit', 'late_fee', 'refund', 'bonus', 'subscription_extension'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            reason: {
                type: String,
                required: true
            },
            appliedBy: {
                type: String,
                required: true
            },
            appliedDate: {
                type: Date,
                default: Date.now
            }
        }],
    leaveCredits: [{
            leaveId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'UserLeave',
                required: true
            },
            creditAmount: {
                type: Number,
                required: true,
                min: 0
            },
            appliedDate: {
                type: Date,
                default: Date.now
            }
        }],
    subscriptionExtension: {
        extensionMeals: {
            type: Number,
            default: 0
        },
        extensionDays: {
            type: Number,
            default: 0
        },
        originalEndDate: {
            type: Date
        },
        newEndDate: {
            type: Date
        }
    },
    metadata: {
        generatedBy: {
            type: String,
            enum: ['system', 'admin', 'mess_owner'],
            required: true
        },
        notes: {
            type: String,
            maxlength: 1000
        },
        tags: [{
                type: String,
                maxlength: 50
            }]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for better query performance
BillingSchema.index({ userId: 1, messId: 1 });
BillingSchema.index({ 'payment.status': 1, 'payment.dueDate': 1 });
BillingSchema.index({ 'billingPeriod.startDate': 1, 'billingPeriod.endDate': 1 });
BillingSchema.index({ createdAt: -1 });
// Virtual for calculating days overdue
BillingSchema.virtual('daysOverdue').get(function () {
    if (this.payment.status === 'overdue' && this.payment.dueDate) {
        const now = new Date();
        const dueDate = new Date(this.payment.dueDate);
        return Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
});
// Virtual for calculating final amount after adjustments
BillingSchema.virtual('finalAmount').get(function () {
    const adjustmentTotal = this.adjustments.reduce((sum, adj) => {
        return adj.type === 'discount' || adj.type === 'leave_credit' || adj.type === 'refund'
            ? sum - adj.amount
            : sum + adj.amount;
    }, 0);
    return Math.max(0, this.subscription.totalAmount + adjustmentTotal);
});
// Pre-save middleware to update payment status based on due date
BillingSchema.pre('save', function (next) {
    if (this.payment.status === 'pending' && this.payment.dueDate < new Date()) {
        this.payment.status = 'overdue';
    }
    next();
});
// Static method to find overdue bills
BillingSchema.statics.findOverdue = function () {
    return this.find({
        'payment.status': { $in: ['pending', 'overdue'] },
        'payment.dueDate': { $lt: new Date() }
    });
};
// Instance method to apply adjustment
BillingSchema.methods.applyAdjustment = function (type, amount, reason, appliedBy) {
    this.adjustments.push({
        type,
        amount,
        reason,
        appliedBy,
        appliedDate: new Date()
    });
    // Recalculate total if needed
    return this.save();
};
// Instance method to mark as paid
BillingSchema.methods.markAsPaid = function (transactionId, paymentMethod, gatewayResponse) {
    this.payment.status = 'paid';
    this.payment.paidDate = new Date();
    this.payment.transactionId = transactionId;
    this.payment.method = paymentMethod;
    if (gatewayResponse) {
        this.payment.gatewayResponse = gatewayResponse;
    }
    return this.save();
};
const Billing = mongoose_1.default.model('Billing', BillingSchema);
exports.default = Billing;
//# sourceMappingURL=Billing.js.map