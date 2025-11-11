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
const readEntrySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    readAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });
const broadcastNotificationSchema = new mongoose_1.Schema({
    audience: {
        type: String,
        enum: ['all', 'role', 'mess_members'],
        required: [true, 'Audience is required']
    },
    roles: [{
            type: String,
            enum: ['user', 'mess-owner', 'admin'],
            required: false
        }],
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: false
    },
    type: {
        type: String,
        enum: ['join_request', 'payment_request', 'payment_received', 'leave_request', 'bill_due', 'meal_plan_change', 'general'],
        default: 'general'
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
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    startAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: false
    },
    reads: {
        type: [readEntrySchema],
        default: []
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'CreatedBy is required']
    }
}, {
    timestamps: true
});
broadcastNotificationSchema.index({ audience: 1, startAt: -1 });
broadcastNotificationSchema.index({ roles: 1, startAt: -1 });
broadcastNotificationSchema.index({ messId: 1, startAt: -1 });
broadcastNotificationSchema.index({ startAt: -1 });
const BroadcastNotification = mongoose_1.default.model('BroadcastNotification', broadcastNotificationSchema);
exports.default = BroadcastNotification;
//# sourceMappingURL=BroadcastNotification.js.map