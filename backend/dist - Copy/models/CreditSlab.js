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
const CreditSlabSchema = new mongoose_1.Schema({
    minUsers: {
        type: Number,
        required: true,
        min: 1
    },
    maxUsers: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value >= this.minUsers;
            },
            message: 'maxUsers must be greater than or equal to minUsers'
        }
    },
    creditsPerUser: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
// Index for efficient range queries
CreditSlabSchema.index({ minUsers: 1, maxUsers: 1 });
CreditSlabSchema.index({ isActive: 1 });
// Static method to find applicable slab for user count
CreditSlabSchema.statics.findApplicableSlab = function (userCount) {
    return this.findOne({
        minUsers: { $lte: userCount },
        maxUsers: { $gte: userCount },
        isActive: true
    }).sort({ minUsers: 1 });
};
// Static method to calculate total credits for user count
CreditSlabSchema.statics.calculateCredits = async function (userCount) {
    // @ts-ignore - Custom static method
    const slab = await this.findApplicableSlab(userCount);
    if (!slab) {
        throw new Error(`No credit slab found for ${userCount} users`);
    }
    return userCount * slab.creditsPerUser;
};
exports.default = mongoose_1.default.model('CreditSlab', CreditSlabSchema);
//# sourceMappingURL=CreditSlab.js.map