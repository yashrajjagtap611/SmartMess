"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mealActivationSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    messId: {
        type: String,
        required: true,
        index: true
    },
    mealId: {
        type: String,
        required: true,
        index: true
    },
    mealPlanId: {
        type: String,
        required: true,
        index: true
    },
    mealType: {
        type: String,
        required: true,
        enum: ['breakfast', 'lunch', 'dinner'],
        index: true
    },
    activationDate: {
        type: Date,
        required: true,
        index: true
    },
    activationTime: {
        type: Date,
        required: true
    },
    qrCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    scannedBy: {
        type: String,
        index: true
    },
    scannedAt: {
        type: Date,
        index: true
    },
    status: {
        type: String,
        required: true,
        enum: ['generated', 'activated', 'expired'],
        default: 'generated',
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    metadata: {
        deviceInfo: String,
        location: String,
        scannerType: {
            type: String,
            enum: ['user', 'mess_owner']
        }
    }
}, {
    timestamps: true
});
// Compound indexes for efficient queries
mealActivationSchema.index({ userId: 1, activationDate: -1 });
mealActivationSchema.index({ messId: 1, activationDate: -1 });
mealActivationSchema.index({ userId: 1, mealType: 1, activationDate: -1 });
mealActivationSchema.index({ qrCode: 1, status: 1 });
mealActivationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired records
// Pre-save middleware to handle expiration
mealActivationSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        // Set expiration to end of day for the activation date
        const endOfDay = new Date(this.activationDate);
        endOfDay.setHours(23, 59, 59, 999);
        this.expiresAt = endOfDay;
    }
    next();
});
exports.default = (0, mongoose_1.model)('MealActivation', mealActivationSchema);
//# sourceMappingURL=MealActivation.js.map