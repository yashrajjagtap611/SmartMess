"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRazorpayConfig = exports.razorpayConfig = exports.razorpayInstance = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize Razorpay instance
exports.razorpayInstance = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});
// Razorpay configuration
exports.razorpayConfig = {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    currency: 'INR',
    receiptPrefix: 'SM_CREDIT_'
};
// Validate Razorpay configuration
const validateRazorpayConfig = () => {
    if (!exports.razorpayConfig.keyId || !exports.razorpayConfig.keySecret) {
        console.warn('⚠️  Razorpay credentials not configured. Payment features will be disabled.');
        return false;
    }
    return true;
};
exports.validateRazorpayConfig = validateRazorpayConfig;
exports.default = exports.razorpayInstance;
//# sourceMappingURL=razorpay.js.map