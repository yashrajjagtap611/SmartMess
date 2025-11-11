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
const MessOffDaySchema = new mongoose_1.Schema({
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: true,
        index: true
    },
    offDate: {
        type: Date,
        required: true,
        index: true
    },
    reason: {
        type: String,
        required: false,
        default: '',
        maxlength: 500,
        trim: true
    },
    mealTypes: [{
            type: String,
            enum: ['breakfast', 'lunch', 'dinner'],
            required: true
        }],
    billingDeduction: {
        type: Boolean,
        default: false
    },
    subscriptionExtension: {
        type: Boolean,
        default: false
    },
    extensionDays: {
        type: Number,
        min: 1,
        max: 30,
        default: 1
    },
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active',
        index: true
    },
    isRange: { type: Boolean, default: false },
    rangeStartDate: { type: Date },
    rangeEndDate: { type: Date },
    startDateMealTypes: [{ type: String, enum: ['breakfast', 'lunch', 'dinner'] }],
    endDateMealTypes: [{ type: String, enum: ['breakfast', 'lunch', 'dinner'] }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
// Indexes for better query performance
MessOffDaySchema.index({ messId: 1, offDate: 1 });
MessOffDaySchema.index({ offDate: 1 });
MessOffDaySchema.index({ createdBy: 1 });
// Ensure only one ACTIVE off day per mess per date
// Allows creating a new off-day for the same date after cancellation
MessOffDaySchema.index({ messId: 1, offDate: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });
const MessOffDay = mongoose_1.default.model('MessOffDay', MessOffDaySchema);
exports.default = MessOffDay;
//# sourceMappingURL=MessOffDay.js.map