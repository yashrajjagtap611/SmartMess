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
const AdCampaignSchema = new mongoose_1.Schema({
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: true
    },
    campaignType: {
        type: String,
        enum: ['ad_card', 'messaging', 'both'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String
    },
    linkUrl: {
        type: String
    },
    callToAction: {
        type: String,
        maxlength: 50
    },
    audienceFilters: {
        messIds: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'MessProfile'
            }],
        roles: [{
                type: String,
                enum: ['user', 'mess-owner', 'admin']
            }],
        genders: [{
                type: String,
                enum: ['male', 'female', 'other']
            }],
        ageRange: {
            min: { type: Number, min: 0, max: 150 },
            max: { type: Number, min: 0, max: 150 }
        },
        membershipStatus: [{
                type: String,
                enum: ['active', 'pending', 'inactive', 'cancelled']
            }]
    },
    targetUserCount: {
        type: Number,
        default: 0,
        min: 0
    },
    actualReach: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected'],
        default: 'draft'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    creditsRequired: {
        type: Number,
        required: true,
        min: 0
    },
    creditsUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    creditCostPerUser: {
        type: Number,
        required: true,
        min: 0
    },
    messagingWindowStart: {
        type: Date
    },
    messagingWindowEnd: {
        type: Date
    },
    messagingRoomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ChatRoom'
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    impressions: {
        type: Number,
        default: 0,
        min: 0
    },
    clicks: {
        type: Number,
        default: 0,
        min: 0
    },
    messagesSent: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });
// Indexes
AdCampaignSchema.index({ messId: 1, status: 1 });
AdCampaignSchema.index({ status: 1, startDate: 1, endDate: 1 });
AdCampaignSchema.index({ campaignType: 1, status: 1 });
exports.default = mongoose_1.default.model('AdCampaign', AdCampaignSchema);
//# sourceMappingURL=AdCampaign.js.map