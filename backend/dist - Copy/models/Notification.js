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
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: false
    },
    type: {
        type: String,
        enum: ['join_request', 'payment_request', 'payment_received', 'payment_reminder', 'payment_overdue', 'payment_success', 'payment_failed', 'leave_request', 'leave_extension', 'bill_due', 'meal_plan_change', 'general', 'subscription_renewal', 'payment_method_update', 'mess_off_day'],
        required: [true, 'Notification type is required']
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});
// Create indexes for better performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, priority: 1 });
notificationSchema.index({ messId: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'data.paymentType': 1 });
notificationSchema.index({ 'data.dueDate': 1 });
// Static method to find existing notifications
notificationSchema.statics['findExistingNotification'] = async function (userId, type, messId) {
    const query = { userId, type };
    if (messId)
        query.messId = messId;
    return this.findOne(query).sort({ createdAt: -1 });
};
// Pre-save middleware to set priority based on type and data
notificationSchema.pre('save', function (next) {
    // Auto-set priority based on notification type
    if (this.type === 'payment_overdue' || this.type === 'payment_reminder') {
        this.priority = 'high';
    }
    else if (this.type === 'payment_failed' || this.type === 'bill_due') {
        this.priority = 'urgent';
    }
    else if (this.type === 'join_request' || this.type === 'payment_request') {
        this.priority = 'medium';
    }
    else {
        this.priority = 'low';
    }
    // Auto-set expiration for certain notification types
    if (!this.expiresAt) {
        if (this.type === 'payment_reminder') {
            this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }
        else if (this.type === 'payment_overdue') {
            this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }
    }
    next();
});
const Notification = mongoose_1.default.model('Notification', notificationSchema);
exports.default = Notification;
//# sourceMappingURL=Notification.js.map