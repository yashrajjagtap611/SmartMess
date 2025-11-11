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
const FreeTrialSettingsSchema = new mongoose_1.Schema({
    isGloballyEnabled: {
        type: Boolean,
        default: true
    },
    defaultTrialDurationDays: {
        type: Number,
        default: 7,
        min: 1,
        max: 90
    },
    trialCredits: {
        type: Number,
        default: 100,
        min: 0
    },
    allowedFeatures: [{
            type: String,
            trim: true
        }],
    restrictedFeatures: [{
            type: String,
            trim: true
        }],
    maxTrialsPerMess: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },
    cooldownPeriodDays: {
        type: Number,
        default: 30,
        min: 0
    },
    autoActivateOnRegistration: {
        type: Boolean,
        default: true
    },
    requiresApproval: {
        type: Boolean,
        default: false
    },
    notificationSettings: {
        sendWelcomeEmail: {
            type: Boolean,
            default: true
        },
        sendReminderEmails: {
            type: Boolean,
            default: true
        },
        reminderDays: [{
                type: Number,
                min: 1
            }],
        sendExpiryNotification: {
            type: Boolean,
            default: true
        }
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
// Ensure only one settings document exists
FreeTrialSettingsSchema.index({}, { unique: true });
// Default reminder days
FreeTrialSettingsSchema.pre('save', function (next) {
    if (!this.notificationSettings.reminderDays || this.notificationSettings.reminderDays.length === 0) {
        this.notificationSettings.reminderDays = [3, 1]; // 3 days and 1 day before expiry
    }
    next();
});
// Static method to get current settings
FreeTrialSettingsSchema.statics.getCurrentSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        // Create default settings if none exist
        settings = await this.create({
            isGloballyEnabled: true,
            defaultTrialDurationDays: 7,
            trialCredits: 100,
            allowedFeatures: ['basic_features', 'limited_users'],
            restrictedFeatures: ['premium_analytics', 'bulk_operations'],
            maxTrialsPerMess: 1,
            cooldownPeriodDays: 30,
            autoActivateOnRegistration: true,
            requiresApproval: false,
            notificationSettings: {
                sendWelcomeEmail: true,
                sendReminderEmails: true,
                reminderDays: [3, 1],
                sendExpiryNotification: true
            },
            updatedBy: new mongoose_1.default.Types.ObjectId() // Will be set by admin
        });
    }
    return settings;
};
// Static method to update settings
FreeTrialSettingsSchema.statics.updateSettings = function (updates, updatedBy) {
    return this.findOneAndUpdate({}, { ...updates, updatedBy }, { new: true, upsert: true });
};
exports.default = mongoose_1.default.model('FreeTrialSettings', FreeTrialSettingsSchema);
//# sourceMappingURL=FreeTrialSettings.js.map