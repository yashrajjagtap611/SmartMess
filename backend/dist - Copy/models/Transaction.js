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
const transactionSchema = new mongoose_1.Schema({
    transactionId: {
        type: String,
        required: [true, 'Transaction ID is required'],
        unique: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: [true, 'Mess ID is required']
    },
    membershipId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessMembership'
    },
    billingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Billing'
    },
    subscriptionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    type: {
        type: String,
        enum: ['payment', 'refund', 'adjustment', 'subscription', 'leave_credit'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR',
        required: [true, 'Currency is required']
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'online', 'cash', 'bank_transfer', 'cheque'],
        required: [true, 'Payment method is required']
    },
    gateway: {
        name: {
            type: String,
            required: [true, 'Gateway name is required']
        },
        transactionId: {
            type: String
        },
        gatewayResponse: {
            type: mongoose_1.Schema.Types.Mixed
        },
        webhookData: {
            type: mongoose_1.Schema.Types.Mixed
        }
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    metadata: {
        ipAddress: {
            type: String
        },
        userAgent: {
            type: String
        },
        deviceInfo: {
            type: mongoose_1.Schema.Types.Mixed
        },
        location: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            },
            city: {
                type: String
            },
            state: {
                type: String
            },
            country: {
                type: String
            }
        },
        notes: {
            type: String
        },
        tags: [{
                type: String
            }]
    },
    refund: {
        refundId: {
            type: String
        },
        refundAmount: {
            type: Number,
            min: [0, 'Refund amount cannot be negative']
        },
        refundReason: {
            type: String
        },
        refundedAt: {
            type: Date
        },
        refundedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        gatewayRefundId: {
            type: String
        }
    }
}, {
    timestamps: true
});
// Indexes for better performance
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ userId: 1, messId: 1 });
transactionSchema.index({ membershipId: 1 });
transactionSchema.index({ billingId: 1 });
transactionSchema.index({ subscriptionId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ 'gateway.name': 1 });
transactionSchema.index({ createdAt: -1 });
// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function (next) {
    if (this.isNew && !this.transactionId) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.transactionId = `TXN_${timestamp}_${random}`;
    }
    next();
});
// Instance method to process refund
transactionSchema.methods.processRefund = function (refundAmount, refundReason, refundedBy, gatewayRefundId) {
    this.status = 'refunded';
    this.refund = {
        refundId: `REF_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        refundAmount,
        refundReason,
        refundedAt: new Date(),
        refundedBy,
        gatewayRefundId
    };
    return this.save();
};
// Static method to find transactions by user
transactionSchema.statics.findByUser = function (userId, messId) {
    const query = { userId };
    if (messId) {
        query.messId = messId;
    }
    return this.find(query).sort({ createdAt: -1 });
};
// Static method to find transactions by status
transactionSchema.statics.findByStatus = function (status) {
    return this.find({ status }).sort({ createdAt: -1 });
};
// Static method to find transactions by date range
transactionSchema.statics.findByDateRange = function (startDate, endDate) {
    return this.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ createdAt: -1 });
};
// Static method to get transaction summary
transactionSchema.statics.getSummary = function (userId, messId, startDate, endDate) {
    const match = {};
    if (userId)
        match.userId = userId;
    if (messId)
        match.messId = messId;
    if (startDate && endDate) {
        match.createdAt = { $gte: startDate, $lte: endDate };
    }
    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);
};
const Transaction = mongoose_1.default.model('Transaction', transactionSchema);
exports.default = Transaction;
//# sourceMappingURL=Transaction.js.map