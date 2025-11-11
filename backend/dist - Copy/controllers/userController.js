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
exports.UserController = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt = __importStar(require("bcryptjs"));
const cloudinaryService_1 = require("../services/cloudinaryService");
const logger_1 = __importDefault(require("../utils/logger"));
class UserController {
    // Get current user's profile
    static async getProfile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }
            const userData = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status || 'active',
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            if (user.profilePicture) {
                userData.avatar = user.profilePicture;
            }
            if (user.address) {
                userData.address = user.address;
            }
            if (user.gender) {
                userData.gender = user.gender;
            }
            if (user.dob) {
                userData.dob = user.dob;
            }
            if (user.lastLogin) {
                userData.lastLogin = user.lastLogin;
            }
            return res.json({
                success: true,
                message: 'Profile fetched successfully',
                data: userData
            });
        }
        catch (error) {
            logger_1.default.error('Profile fetch error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch profile',
                code: 'PROFILE_FETCH_ERROR'
            });
        }
    }
    // Upload profile picture
    static async uploadAvatar(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                    code: 'NO_FILE_UPLOADED'
                });
            }
            let profilePictureUrl = '';
            // Try Cloudinary first
            try {
                profilePictureUrl = await (0, cloudinaryService_1.uploadImage)(req.file.path, 'profile-pictures');
                logger_1.default.info('Profile picture uploaded to Cloudinary:', {
                    userId: user._id,
                    url: profilePictureUrl
                });
            }
            catch (cloudErr) {
                logger_1.default.warn('Cloudinary upload failed, falling back to local:', cloudErr);
                // Fallback to local if Cloudinary failed
                profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/profile-pictures/${req.file.filename}`;
            }
            // Update user's profile picture in database
            const updatedUser = await User_1.default.findByIdAndUpdate(user._id, { profilePicture: profilePictureUrl }, { new: true }).select('-password');
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found after update',
                    code: 'USER_NOT_FOUND'
                });
            }
            return res.json({
                success: true,
                message: 'Profile picture uploaded successfully',
                data: { avatar: profilePictureUrl }
            });
        }
        catch (error) {
            logger_1.default.error('Profile picture upload error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload profile picture',
                code: 'AVATAR_UPLOAD_ERROR'
            });
        }
    }
    // Update user profile
    static async updateProfile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }
            // Only allow updating these fields
            const allowedFields = [
                'firstName', 'lastName', 'phone', 'avatar', 'address', 'gender', 'dob', 'status'
            ];
            const updates = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates[field === 'avatar' ? 'profilePicture' : field] = req.body[field];
                }
            }
            // Validate gender and status
            if (updates.gender && !['male', 'female', 'other'].includes(updates.gender)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid gender',
                    code: 'INVALID_GENDER'
                });
            }
            if (updates.status && !['active', 'suspended'].includes(updates.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                    code: 'INVALID_STATUS'
                });
            }
            // Update user in DB
            const updatedUser = await User_1.default.findByIdAndUpdate(user._id, updates, { new: true }).select('-password');
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found after update',
                    code: 'USER_NOT_FOUND'
                });
            }
            const userData = {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                status: updatedUser.status || 'active',
                isVerified: updatedUser.isVerified,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            };
            if (updatedUser.profilePicture) {
                userData.avatar = updatedUser.profilePicture;
            }
            if (updatedUser.address) {
                userData.address = updatedUser.address;
            }
            if (updatedUser.gender) {
                userData.gender = updatedUser.gender;
            }
            if (updatedUser.dob) {
                userData.dob = updatedUser.dob;
            }
            if (updatedUser.lastLogin) {
                userData.lastLogin = updatedUser.lastLogin;
            }
            return res.json({
                success: true,
                message: 'Profile updated successfully',
                data: userData
            });
        }
        catch (error) {
            logger_1.default.error('Profile update error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                code: 'PROFILE_UPDATE_ERROR'
            });
        }
    }
    // Get user activity log
    static async getActivity(req, res) {
        try {
            // In a real app, fetch from an Activity collection or audit log
            const activities = [
                { type: 'register', date: '2024-01-01T10:00:00Z', description: 'Registered account' },
                { type: 'login', date: '2024-06-01T09:00:00Z', description: 'Logged in' },
                { type: 'profile_update', date: '2024-06-10T12:00:00Z', description: 'Updated profile' },
                { type: 'password_change', date: '2024-06-15T15:00:00Z', description: 'Changed password' }
            ];
            return res.json({
                success: true,
                message: 'Activity fetched successfully',
                data: { activities }
            });
        }
        catch (error) {
            logger_1.default.error('Activity fetch error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch activity',
                code: 'ACTIVITY_FETCH_ERROR'
            });
        }
    }
    // Change user password
    static async changePassword(req, res) {
        try {
            const user = req.user;
            const { currentPassword, newPassword, confirmPassword } = req.body;
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }
            // Validate input
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All password fields are required',
                    code: 'MISSING_PASSWORD_FIELDS'
                });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirm password do not match',
                    code: 'PASSWORD_MISMATCH'
                });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters long',
                    code: 'PASSWORD_TOO_SHORT'
                });
            }
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect',
                    code: 'INVALID_CURRENT_PASSWORD'
                });
            }
            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
            // Update password
            await User_1.default.findByIdAndUpdate(user._id, { password: hashedNewPassword });
            logger_1.default.info('Password changed successfully:', { userId: user._id });
            return res.json({
                success: true,
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Password change error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to change password',
                code: 'PASSWORD_CHANGE_ERROR'
            });
        }
    }
}
exports.UserController = UserController;
exports.default = UserController;
//# sourceMappingURL=userController.js.map