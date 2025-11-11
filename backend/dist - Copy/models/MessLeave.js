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
exports.MessLeave = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MessLeaveSchema = new mongoose_1.Schema({
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessProfile',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    leaveType: {
        type: String,
        enum: ['holiday', 'maintenance', 'personal', 'emergency', 'seasonal', 'other'],
        required: true
    },
    reason: {
        type: String,
        trim: true
    },
    mealTypes: [{
            type: String,
            enum: ['breakfast', 'lunch', 'dinner'],
            required: true
        }],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringPattern: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        interval: {
            type: Number,
            min: 1
        },
        daysOfWeek: [{
                type: Number,
                min: 0,
                max: 6
            }],
        endDate: Date,
        occurrences: {
            type: Number,
            min: 1
        }
    },
    status: {
        type: String,
        enum: ['scheduled', 'active', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notificationsSent: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    affectedUsers: {
        type: Number,
        default: 0
    },
    estimatedSavings: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true
});
// Indexes for better query performance
MessLeaveSchema.index({ messId: 1, startDate: 1 });
MessLeaveSchema.index({ messId: 1, status: 1 });
MessLeaveSchema.index({ createdBy: 1 });
MessLeaveSchema.index({ startDate: 1, endDate: 1 });
// Validation to ensure endDate is not before startDate
MessLeaveSchema.pre('save', function (next) {
    if (this['endDate'] < this['startDate']) {
        next(new Error('End date cannot be before start date'));
    }
    else {
        next();
    }
});
// Auto-update status based on dates
MessLeaveSchema.pre('save', function (next) {
    const now = new Date();
    if (this['status'] === 'scheduled') {
        if (now >= this['startDate'] && now <= this['endDate']) {
            this['status'] = 'active';
        }
        else if (now > this['endDate']) {
            this['status'] = 'completed';
        }
    }
    next();
});
exports.MessLeave = mongoose_1.default.model('MessLeave', MessLeaveSchema);
//# sourceMappingURL=MessLeave.js.map