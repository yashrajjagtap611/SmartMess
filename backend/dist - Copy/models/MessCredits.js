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
const MessCreditsSchema = new mongoose_1.Schema({
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: true,
        unique: true
    },
    totalCredits: {
        type: Number,
        default: 0,
        min: 0
    },
    usedCredits: {
        type: Number,
        default: 0,
        min: 0
    },
    availableCredits: {
        type: Number,
        default: 0,
        min: 0
    },
    lastBillingDate: {
        type: Date,
        default: null
    },
    nextBillingDate: {
        type: Date,
        default: null
    },
    isTrialActive: {
        type: Boolean,
        default: false
    },
    trialStartDate: {
        type: Date,
        default: null
    },
    trialEndDate: {
        type: Date,
        default: null
    },
    trialCreditsUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    monthlyUserCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastUserCountUpdate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'trial', 'expired'],
        default: 'trial'
    },
    autoRenewal: {
        type: Boolean,
        default: false
    },
    lastBillingAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    pendingBillAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    lowCreditThreshold: {
        type: Number,
        default: 100,
        min: 0
    }
}, {
    timestamps: true
});
// Pre-save middleware to calculate available credits
MessCreditsSchema.pre('save', function (next) {
    this.availableCredits = Math.max(0, this.totalCredits - this.usedCredits);
    next();
});
// Index for efficient queries
MessCreditsSchema.index({ messId: 1 });
MessCreditsSchema.index({ status: 1 });
MessCreditsSchema.index({ nextBillingDate: 1 });
MessCreditsSchema.index({ trialEndDate: 1 });
// Instance methods
MessCreditsSchema.methods.deductCredits = function (amount) {
    if (this.availableCredits < amount) {
        throw new Error('Insufficient credits');
    }
    this.usedCredits += amount;
    this.availableCredits = Math.max(0, this.totalCredits - this.usedCredits);
    return this.save();
};
MessCreditsSchema.methods.addCredits = function (amount) {
    this.totalCredits += amount;
    this.availableCredits = Math.max(0, this.totalCredits - this.usedCredits);
    return this.save();
};
MessCreditsSchema.methods.isTrialExpired = function () {
    return this.isTrialActive && this.trialEndDate && new Date() > this.trialEndDate;
};
MessCreditsSchema.methods.canAccessPaidFeatures = function () {
    return this.availableCredits > 0 || (this.isTrialActive && !this.isTrialExpired());
};
// Static methods
MessCreditsSchema.statics.findByMessId = function (messId) {
    return this.findOne({ messId });
};
MessCreditsSchema.statics.findExpiredTrials = function () {
    return this.find({
        isTrialActive: true,
        trialEndDate: { $lt: new Date() }
    });
};
MessCreditsSchema.statics.findDueBilling = function () {
    return this.find({
        nextBillingDate: { $lte: new Date() },
        status: { $in: ['active', 'trial'] }
    });
};
exports.default = mongoose_1.default.model('MessCredits', MessCreditsSchema);
//# sourceMappingURL=MessCredits.js.map