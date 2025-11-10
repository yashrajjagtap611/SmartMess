import { Request, Response } from 'express';
import User from '../models/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import Otp from '../models/Otp';
import emailService from '../services/emailService';
import logger from '../utils/logger';
import config from '../config';
import { IAuthResponse, IUserRegistration, IUserLogin, IJWTPayload } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { firstName, lastName, email, phone, password, role } = req.body as IUserRegistration;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
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
      const user = new User({
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
        await emailService.sendOTP(email, 'verification');
        logger.info('User registered successfully:', { email, role });

        const response: IAuthResponse = {
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
      } catch (emailError: any) {
        // Handle rate limiting and other email service errors
        if (emailError.message.includes('wait') || emailError.message.includes('rate limit')) {
          return res.status(429).json({
            success: false,
            message: emailError.message,
            code: 'RATE_LIMIT_EXCEEDED'
          });
        } else {
          throw emailError; // Re-throw other errors to be caught by outer catch
        }
      }
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body as IUserLogin;

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
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
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        } as IJWTPayload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info('User logged in successfully:', { email, role: user.role });

      const response: IAuthResponse = {
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
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  }

  // Verify OTP
  static async verifyOtp(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp } = req.body;

      // Find OTP record
      const otpRecord = await Otp.findOne({
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
      await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { isVerified: true }
      );

      // Delete used OTP
      await Otp.findByIdAndDelete(otpRecord._id);

      logger.info('Email verified successfully:', { email });

      return res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('OTP verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        code: 'OTP_VERIFICATION_ERROR'
      });
    }
  }

  // Resend OTP
  static async resendOtp(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Delete existing OTP
      await Otp.deleteMany({ email: email.toLowerCase() });

      // Generate and send OTP
      try {
        await emailService.sendOTP(email, 'verification');
        logger.info('OTP resent successfully:', { email });

        return res.json({
          success: true,
          message: 'OTP sent successfully'
        });
      } catch (emailError: any) {
        // Handle rate limiting and other email service errors
        if (emailError.message.includes('wait') || emailError.message.includes('rate limit')) {
          return res.status(429).json({
            success: false,
            message: emailError.message,
            code: 'RATE_LIMIT_EXCEEDED'
          });
        } else {
          throw emailError; // Re-throw other errors to be caught by outer catch
        }
      }
    } catch (error) {
      logger.error('Resend OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
        code: 'RESEND_OTP_ERROR'
      });
    }
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Generate and send reset OTP
      try {
        await emailService.sendOTP(email, 'password_reset');
        logger.info('Password reset OTP sent:', { email });

        return res.json({
          success: true,
          message: 'Password reset OTP sent successfully'
        });
      } catch (emailError: any) {
        // Handle rate limiting and other email service errors
        if (emailError.message.includes('wait') || emailError.message.includes('rate limit')) {
          return res.status(429).json({
            success: false,
            message: emailError.message,
            code: 'RATE_LIMIT_EXCEEDED'
          });
        } else {
          throw emailError; // Re-throw other errors to be caught by outer catch
        }
      }
    } catch (error) {
      logger.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset OTP',
        code: 'FORGOT_PASSWORD_ERROR'
      });
    }
  }

  // Verify OTP for password reset
  static async verifyResetOtp(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp } = req.body;

      // Validate OTP
      const otpRecord = await Otp.findOne({
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

      logger.info('OTP verified for password reset:', { email });

      return res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      logger.error('Verify reset OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        code: 'OTP_VERIFICATION_ERROR'
      });
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp, newPassword } = req.body;

      // Verify OTP
      const otpRecord = await Otp.findOne({
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
      await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { password: hashedPassword }
      );

      // Delete used OTP
      await Otp.findByIdAndDelete(otpRecord._id);

      logger.info('Password reset successfully:', { email });

      return res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Password reset failed',
        code: 'RESET_PASSWORD_ERROR'
      });
    }
  }

  // Logout (client-side token removal)
  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('User logged out:', { userId: (req as AuthRequest).user?.id });
      
      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as AuthRequest).user;
      
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
    } catch (error) {
      logger.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        code: 'PROFILE_FETCH_ERROR'
      });
    }
  }
}

export default AuthController; 