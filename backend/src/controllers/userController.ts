import { Request, Response } from 'express';
import User from '../models/User';
import * as bcrypt from 'bcryptjs';

import { uploadImage, deleteImage, getPublicIdFromUrl } from '../services/cloudinaryService';
import logger from '../utils/logger';
import { IUserProfile, IUserUpdate } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

export class UserController {
  // Get current user's profile
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

      const userData: IUserProfile = {
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
    } catch (error) {
      logger.error('Profile fetch error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch profile',
        code: 'PROFILE_FETCH_ERROR'
      });
    }
  }

  // Upload profile picture
  static async uploadAvatar(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as AuthRequest).user;
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
        profilePictureUrl = await uploadImage(req.file.path, 'profile-pictures');
        logger.info('Profile picture uploaded to Cloudinary:', { 
          userId: user._id, 
          url: profilePictureUrl 
        });
      } catch (cloudErr) {
        logger.warn('Cloudinary upload failed, falling back to local:', cloudErr);
        // Fallback to local if Cloudinary failed
        profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/profile-pictures/${req.file.filename}`;
      }

      // Update user's profile picture in database
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { profilePicture: profilePictureUrl },
        { new: true }
      ).select('-password');

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
    } catch (error) {
      logger.error('Profile picture upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture',
        code: 'AVATAR_UPLOAD_ERROR'
      });
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as AuthRequest).user;
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
      
      const updates: any = {};
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
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        updates,
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found after update',
          code: 'USER_NOT_FOUND'
        });
      }

      const userData: IUserProfile = {
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
    } catch (error) {
      logger.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }

  // Get user activity log
  static async getActivity(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Activity fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch activity',
        code: 'ACTIVITY_FETCH_ERROR'
      });
    }
  }

  // Change user password
  static async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as AuthRequest).user;
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
      await User.findByIdAndUpdate(user._id, { password: hashedNewPassword });

      logger.info('Password changed successfully:', { userId: user._id });

      return res.json({ 
        success: true, 
        message: 'Password changed successfully' 
      });
    } catch (error) {
      logger.error('Password change error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to change password',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }
}

export default UserController; 