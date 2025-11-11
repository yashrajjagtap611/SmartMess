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
const paymentGatewaySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Gateway name is required'],
        unique: true
    },
    type: {
        type: String,
        enum: ['razorpay', 'stripe', 'payu', 'paytm', 'custom'],
        required: [true, 'Gateway type is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    configuration: {
        apiKey: {
            type: String,
            required: [true, 'API key is required']
        },
        secretKey: {
            type: String,
            required: [true, 'Secret key is required']
        },
        webhookSecret: {
            type: String
        },
        merchantId: {
            type: String
        },
        environment: {
            type: String,
            enum: ['sandbox', 'production'],
            default: 'sandbox'
        },
        supportedCurrencies: [{
                type: String,
                default: 'INR'
            }],
        supportedMethods: [{
                type: String,
                enum: ['upi', 'card', 'netbanking', 'wallet', 'emi']
            }]
    },
    features: {
        supportsSubscriptions: {
            type: Boolean,
            default: false
        },
        supportsRefunds: {
            type: Boolean,
            default: true
        },
        supportsPartialRefunds: {
            type: Boolean,
            default: true
        },
        supportsWebhooks: {
            type: Boolean,
            default: true
        },
        supportsUPI: {
            type: Boolean,
            default: true
        },
        supportsCards: {
            type: Boolean,
            default: true
        },
        supportsNetBanking: {
            type: Boolean,
            default: true
        },
        supportsWallet: {
            type: Boolean,
            default: true
        }
    },
    limits: {
        minAmount: {
            type: Number,
            default: 1,
            min: [0, 'Minimum amount cannot be negative']
        },
        maxAmount: {
            type: Number,
            default: 1000000,
            min: [0, 'Maximum amount cannot be negative']
        },
        dailyLimit: {
            type: Number,
            default: 10000000,
            min: [0, 'Daily limit cannot be negative']
        },
        monthlyLimit: {
            type: Number,
            default: 100000000,
            min: [0, 'Monthly limit cannot be negative']
        }
    },
    fees: {
        processingFee: {
            type: Number,
            default: 2.0,
            min: [0, 'Processing fee cannot be negative']
        },
        fixedFee: {
            type: Number,
            default: 0,
            min: [0, 'Fixed fee cannot be negative']
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    metadata: {
        description: {
            type: String
        },
        website: {
            type: String
        },
        supportEmail: {
            type: String
        },
        supportPhone: {
            type: String
        }
    }
}, {
    timestamps: true
});
// Indexes
paymentGatewaySchema.index({ type: 1, isActive: 1 });
paymentGatewaySchema.index({ name: 1 });
// Static method to get active gateways
paymentGatewaySchema.statics.getActiveGateways = function () {
    return this.find({ isActive: true });
};
// Static method to get gateway by type
paymentGatewaySchema.statics.getByType = function (type) {
    return this.findOne({ type, isActive: true });
};
const PaymentGateway = mongoose_1.default.model('PaymentGateway', paymentGatewaySchema);
exports.default = PaymentGateway;
//# sourceMappingURL=PaymentGateway.js.map