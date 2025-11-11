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
const ChatRoomSchema = new mongoose_1.Schema({
    name: {
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
    type: {
        type: String,
        enum: ['mess', 'direct', 'admin', 'individual'],
        required: true
    },
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: function () {
            return this.type === 'mess';
        }
    },
    participants: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['user', 'mess-owner', 'admin'],
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            lastSeen: {
                type: Date
            },
            isActive: {
                type: Boolean,
                default: true
            }
        }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Mark whether this room is the default community group for a mess
    isDefault: {
        type: Boolean,
        default: false
    },
    // For individual messaging - track who the conversation is with
    individualWith: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.type === 'individual';
        }
    },
    settings: {
        allowFileUpload: {
            type: Boolean,
            default: true
        },
        allowImageUpload: {
            type: Boolean,
            default: true
        },
        maxFileSize: {
            type: Number,
            default: 10 // 10MB
        },
        messageRetentionDays: {
            type: Number,
            default: 90 // 90 days
        }
    },
    disappearingMessagesDays: {
        type: Number,
        default: null, // null = disabled
        min: 1,
        max: 365
    }
}, {
    timestamps: true
});
// Indexes for better performance
ChatRoomSchema.index({ messId: 1, type: 1 });
ChatRoomSchema.index({ 'participants.userId': 1 });
ChatRoomSchema.index({ type: 1, isActive: 1 });
ChatRoomSchema.index({ createdAt: -1 });
// Note: do not create a unique index on the participants array — creating a
// unique index on an array of subdocuments can cause index creation failures
// and duplicate key errors when multiple rooms have participant arrays. Keep
// participant uniqueness enforced at the application level instead.
exports.default = mongoose_1.default.model('ChatRoom', ChatRoomSchema);
//# sourceMappingURL=ChatRoom.js.map