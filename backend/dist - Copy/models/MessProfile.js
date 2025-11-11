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
const messLocationSchema = new mongoose_1.Schema({
    street: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    district: {
        type: String,
        trim: true,
        default: ''
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{6}$/.test(v);
            },
            message: 'Pincode must be 6 digits'
        }
    },
    country: {
        type: String,
        trim: true,
        default: 'India'
    },
    latitude: {
        type: Number,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        min: -180,
        max: 180
    }
});
const messProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Mess name is required'],
        trim: true,
        minlength: [2, 'Mess name must be at least 2 characters long'],
        maxlength: [100, 'Mess name must be less than 100 characters']
    },
    location: {
        type: messLocationSchema,
        required: [true, 'Location is required']
    },
    colleges: [{
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return v.length > 0;
                },
                message: 'College name cannot be empty'
            }
        }],
    ownerPhone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v)
                    return true; // Optional field
                return /^[+]?[\d\s\-\(\)]{10,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    ownerEmail: {
        type: String,
        required: [true, 'Owner email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    types: [{
            type: String,
            enum: ['Veg', 'Non-Veg', 'Mixed'],
            required: [true, 'At least one mess type is required']
        }],
    logo: {
        type: String,
        default: null
    },
    operatingHours: [
        {
            meal: { type: String, required: true },
            enabled: { type: Boolean, default: true },
            start: { type: String, required: true },
            end: { type: String, required: true },
        }
    ],
    qrCode: {
        image: { type: String }, // Base64 QR code image
        data: { type: String }, // JSON string of QR data
        generatedAt: { type: Date }
    }
}, {
    timestamps: true
});
// Validation middleware
messProfileSchema.pre('save', function (next) {
    // Ensure at least one college is provided
    if (!this.colleges || this.colleges.length === 0) {
        return next(new Error('At least one nearby college is required'));
    }
    // Ensure at least one type is selected
    if (!this.types || this.types.length === 0) {
        return next(new Error('At least one mess type must be selected'));
    }
    next();
});
// Create indexes for better performance
messProfileSchema.index({ userId: 1 });
messProfileSchema.index({ 'location.city': 1 });
messProfileSchema.index({ 'location.state': 1 });
const MessProfile = mongoose_1.default.model('MessProfile', messProfileSchema);
exports.default = MessProfile;
//# sourceMappingURL=MessProfile.js.map