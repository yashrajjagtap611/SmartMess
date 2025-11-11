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
const AdSettingsSchema = new mongoose_1.Schema({
    creditPricePerUserAdCard: {
        type: Number,
        required: true,
        default: 1,
        min: 0
    },
    creditPricePerUserMessaging: {
        type: Number,
        required: true,
        default: 2,
        min: 0
    },
    adCardDelaySeconds: {
        type: Number,
        required: true,
        default: 3,
        min: 0,
        max: 60
    },
    googleAdsEnabled: {
        type: Boolean,
        default: false
    },
    policies: {
        maxAdDurationDays: {
            type: Number,
            default: 30,
            min: 1,
            max: 365
        },
        maxImageSizeMB: {
            type: Number,
            default: 5,
            min: 1,
            max: 50
        },
        maxVideoSizeMB: {
            type: Number,
            default: 50,
            min: 1,
            max: 500
        },
        allowedImageFormats: {
            type: [String],
            default: ['jpg', 'jpeg', 'png', 'webp']
        },
        allowedVideoFormats: {
            type: [String],
            default: ['mp4', 'webm']
        },
        maxTitleLength: {
            type: Number,
            default: 100
        },
        maxDescriptionLength: {
            type: Number,
            default: 500
        },
        requireApproval: {
            type: Boolean,
            default: false
        }
    },
    defaultAdCardDisplayDuration: {
        type: Number,
        default: 5,
        min: 1,
        max: 30
    },
    defaultMessagingWindowHours: {
        type: Number,
        default: 24,
        min: 1,
        max: 168 // 7 days max
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
// Static method to get current settings
AdSettingsSchema.statics.getCurrentSettings = async function () {
    let settings = await this.findOne().sort({ createdAt: -1 });
    if (!settings) {
        // Create default settings
        const defaultUser = await mongoose_1.default.model('User').findOne({ role: 'admin' });
        settings = await this.create({
            creditPricePerUserAdCard: 1,
            creditPricePerUserMessaging: 2,
            adCardDelaySeconds: 3,
            googleAdsEnabled: false,
            policies: {
                maxAdDurationDays: 30,
                maxImageSizeMB: 5,
                maxVideoSizeMB: 50,
                allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
                allowedVideoFormats: ['mp4', 'webm'],
                maxTitleLength: 100,
                maxDescriptionLength: 500,
                requireApproval: false
            },
            defaultAdCardDisplayDuration: 5,
            defaultMessagingWindowHours: 24,
            updatedBy: defaultUser?._id || new mongoose_1.default.Types.ObjectId()
        });
    }
    return settings;
};
exports.default = mongoose_1.default.model('AdSettings', AdSettingsSchema);
//# sourceMappingURL=AdSettings.js.map