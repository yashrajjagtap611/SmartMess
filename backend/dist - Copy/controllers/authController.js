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
exports.AuthController = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const Otp_1 = __importDefault(require("../models/Otp"));
const emailService_1 = __importDefault(require("../services/emailService"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { firstName, lastName, email, phone, password, role } = req.body;
            // Check if user already exists
            const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists with this email',
                    code: 'USER_EXISTS'
                });
            }
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            // Create new user
            const user = new User_1.default({
                firstName,
                lastName,
                email: email.toLowerCase(),
                phone,
                password: hashedPassword,
                role: role || 'user',
                isVerified: false
            });
            await user.save();
            // Generate and send OTP
            try {
                await emailService_1.default.sendOTP(email, 'verification');
                logger_1.default.info('User registered successfully:', { email, role });
                const response = {
                    success: true,
                    message: 'Registration successful. Please verify your email.',
                    data: {
                        user: {
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
                        }
                    }
                };
                return res.status(201).json(response);
            }
            catch (emailError) {
                // Handle rate limiting and other email service errors
                if (emailError.message.includes('wait') || emailError.message.includes('rate limit')) {
                    return res.status(429).json({
                        success: false,
                        message: emailError.message,
                        code: 'RATE_LIMIT_EXCEEDED'
                    });
                }
                else {
                    throw emailError; // Re-throw other errors to be caught by outer catch
                }
            }
        }
        catch (error) {
            logger_1.default.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: 'Registration failed',
                code: 'REGISTRATION_ERROR'
            });
        }
    }
    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // Find user
            const user = await User_1.default.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }
            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }
            // Check if user is verified
            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Please verify your email before logging in',
                    code: 'EMAIL_NOT_VERIFIED'
                });
            }
            // Generate JWT token
            const token = jwt.sign({
                userId: user._id,
                email: user.email,
                role: user.role
            }, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.expiresIn });
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            logger_1.default.info('User logged in successfully:', { email, role: user.role });
            const response = {
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
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
                    }
                }
            };
            return res.json(response);
        }
        catch (error) {
            logger_1.default.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Login failed',
                code: 'LOGIN_ERROR'
            });
        }
    }
    // Verify OTP
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            // Find OTP record
            const otpRecord = await Otp_1.default.findOne({
                email: email.toLowerCase(),
                code: otp,
                type: 'verification',
                expiresAt: { $gt: new Date() }
            });
            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP',
                    code: 'INVALID_OTP'
                });
            }
            // Update user verification status
            await User_1.default.findOneAndUpdate({ email: email.toLowerCase() }, { isVerified: true });
            // Delete used OTP
            await Otp_1.default.findByIdAndDelete(otpRecord._id);
            logger_1.default.info('Email verified successfully:', { email });
            return res.json({
                success: true,
                message: 'Email verified successfully'
            });
        }
        catch (error) {
            logger_1.default.error('OTP verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'OTP verification failed',
                code: 'OTP_VERIFICATION_ERROR'
            });
        }
    }
    // Resend OTP
    static async resendOtp(req, res) {
        try {
            const { email } = req.body;
            // Check if user exists
            const user = await User_1.default.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }
            // Delete existing OTP
            await Otp_1.default.deleteMany({ email: email.toLowerCase() });
            // Generate and send OTP
            try {
                await emailService_1.default.sendOTP(email, 'verification');
                logger_1.default.info('OTP resent successfully:', { email });
                return res.json({
                    success: true,
                    message: 'OTP sent successfully'
                });
            }
            catch (emailError) {
                // Handle rate limiting and other email service errors
                if (emailError.message.includes('wait') || emailError.message.includes('rate limit')) {
                    return res.status(429).json({
                        success: false,
                        message: emailError.message,
                        code: 'RATE_LIMIT_EXCEEDED'
                    });
                }
                else {
                    throw emailError; // Re-throw other errors to be caught by outer catch
                }
            }
        }
        catch (error) {
            logger_1.default.error('Resend OTP error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to resend OTP',
                code: 'RESEND_OTP_ERROR'
            });
        }
    }
    // Forgot password
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            // Check if user exists
            const user = await User_1.default.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }
            // Generate and send reset OTP
            try {
                await emailService_1.default.sendOTP(email, 'password_reset');
                logger_1.default.info('Password reset OTP sent:', { email });
                return res.json({
                    success: true,
                    message: 'Password reset OTP sent successfully'
                });
            }
            catch (emailError) {
                // Handle rate limiting and other email service errors
                if (emailError.message.includes('wait') || emailError.message.includes('rate limit')) {
                    return res.status(429).json({
                        success: false,
                        message: emailError.message,
                        code: 'RATE_LIMIT_EXCEEDED'
                    });
                }
                else {
                    throw emailError; // Re-throw other errors to be caught by outer catch
                }
            }
        }
        catch (error) {
            logger_1.default.error('Forgot password error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset OTP',
                code: 'FORGOT_PASSWORD_ERROR'
            });
        }
    }
    // Verify OTP for password reset
    static async verifyResetOtp(req, res) {
        try {
            const { email, otp } = req.body;
            // Validate OTP
            const otpRecord = await Otp_1.default.findOne({
                email: email.toLowerCase(),
                code: otp,
                type: 'password_reset',
                expiresAt: { $gt: new Date() }
            });
            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP',
                    code: 'INVALID_OTP'
                });
            }
            logger_1.default.info('OTP verified for password reset:', { email });
            return res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Verify reset OTP error:', error);
            return res.status(500).json({
                success: false,
                message: 'OTP verification failed',
                code: 'OTP_VERIFICATION_ERROR'
            });
        }
    }
    // Reset password
    static async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            // Verify OTP
            const otpRecord = await Otp_1.default.findOne({
                email: email.toLowerCase(),
                code: otp,
                type: 'password_reset',
                expiresAt: { $gt: new Date() }
            });
            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP',
                    code: 'INVALID_OTP'
                });
            }
            // Hash new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            // Update password
            await User_1.default.findOneAndUpdate({ email: email.toLowerCase() }, { password: hashedPassword });
            // Delete used OTP
            await Otp_1.default.findByIdAndDelete(otpRecord._id);
            logger_1.default.info('Password reset successfully:', { email });
            return res.json({
                success: true,
                message: 'Password reset successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Reset password error:', error);
            return res.status(500).json({
                success: false,
                message: 'Password reset failed',
                code: 'RESET_PASSWORD_ERROR'
            });
        }
    }
    // Logout (client-side token removal)
    static async logout(req, res) {
        try {
            logger_1.default.info('User logged out:', { userId: req.user?.id });
            return res.json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                message: 'Logout failed',
                code: 'LOGOUT_ERROR'
            });
        }
    }
    // Get current user profile
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
            const userProfile = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.profilePicture || null,
                status: user.status,
                address: user.address,
                gender: user.gender,
                dob: user.dob,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            return res.json({
                success: true,
                message: 'Profile fetched successfully',
                data: userProfile
            });
        }
        catch (error) {
            logger_1.default.error('Get profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch profile',
                code: 'PROFILE_FETCH_ERROR'
            });
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
//# sourceMappingURL=authController.js.map