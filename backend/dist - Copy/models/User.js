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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'mess-owner', 'admin'], required: true },
    isVerified: { type: Boolean, default: false },
    messPhotoUrl: { type: String, default: null }, // For mess logo only
    profilePicture: { type: String, default: null }, // For user profile picture
    lastLogin: { type: Date, default: null },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    address: { type: String, default: '' }, // Legacy field
    currentAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        district: { type: String, default: '' },
        taluka: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null }
    },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    dob: { type: Date, default: null },
    joinDate: { type: Date, default: Date.now },
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MessProfile', default: null },
    isActive: { type: Boolean, default: true },
    mealPlan: {
        breakfastPrice: { type: Number, default: 30 },
        lunchPrice: { type: Number, default: 50 },
        dinnerPrice: { type: Number, default: 40 }
    },
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private', 'mess-only'], default: 'mess-only' },
            showEmail: { type: Boolean, default: false },
            showPhone: { type: Boolean, default: false }
        },
        theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
        language: { type: String, default: 'en' },
        dietary: { type: [String], default: [] },
        allergies: { type: [String], default: [] },
        mealTimes: {
            breakfast: { type: String, default: '08:00' },
            lunch: { type: String, default: '13:00' },
            dinner: { type: String, default: '19:00' }
        }
    },
    // Student information
    isStudent: { type: Boolean, default: false },
    studentInfo: {
        college: { type: String, default: '' },
        course: { type: String, default: '' },
        year: { type: String, default: '' },
        branch: { type: String, default: '' },
        collegeEmailId: { type: String, default: '' }
    },
    // Profession information
    isWorking: { type: Boolean, default: false },
    professionInfo: {
        company: { type: String, default: '' },
        designation: { type: String, default: '' },
        department: { type: String, default: '' },
        workExperience: { type: Number, default: 0 },
        workLocation: { type: String, default: '' },
        employeeId: { type: String, default: '' },
        joiningDate: { type: Date, default: null }
    }
}, { timestamps: true });
// Add index for email lookup optimization
UserSchema.index({ email: 1 });
// Add comparePassword method
UserSchema.methods['comparePassword'] = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this['password']);
};
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
//# sourceMappingURL=User.js.map