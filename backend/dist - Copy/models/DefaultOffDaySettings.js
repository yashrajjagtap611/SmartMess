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
const DefaultOffDaySettingsSchema = new mongoose_1.Schema({
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: true,
        unique: true,
        index: true
    },
    pattern: {
        type: String,
        enum: ['weekly', 'monthly'],
        required: true
    },
    weeklySettings: {
        dayOfWeek: {
            type: Number,
            min: 0,
            max: 6,
            default: 0
        },
        enabled: {
            type: Boolean,
            default: false
        },
        mealTypes: [{
                type: String,
                enum: ['breakfast', 'lunch', 'dinner'],
                default: ['breakfast', 'lunch', 'dinner']
            }]
    },
    monthlySettings: {
        daysOfMonth: [{
                type: Number,
                min: 1,
                max: 31
            }],
        enabled: {
            type: Boolean,
            default: false
        },
        mealTypes: [{
                type: String,
                enum: ['breakfast', 'lunch', 'dinner'],
                default: ['breakfast', 'lunch', 'dinner']
            }]
    },
    billingDeduction: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
// Index for better query performance
DefaultOffDaySettingsSchema.index({ messId: 1 });
const DefaultOffDaySettings = mongoose_1.default.model('DefaultOffDaySettings', DefaultOffDaySettingsSchema);
exports.default = DefaultOffDaySettings;
//# sourceMappingURL=DefaultOffDaySettings.js.map