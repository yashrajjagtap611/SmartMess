import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import PaymentSettings from '../../models/PaymentSettings';
import { AuthenticatedRequest } from '../../types/requests';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const router: Router = Router();

// GET /api/user/settings - Get user's settings
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const user = await User.findById(userId).select('firstName lastName email phone preferences');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get payment settings
    const paymentSettings = await PaymentSettings.findOne({ userId });

    const userSettings = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      },
      preferences: user.preferences || {},
      payment: paymentSettings || null,
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    };

    return res.status(200).json({
      success: true,
      data: userSettings
    });
  } catch (err) {
    console.error('Error fetching user settings:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/settings/profile - Update profile settings
router.put('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { firstName, lastName, phone } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'Profile settings updated successfully'
    });
  } catch (err) {
    console.error('Error updating profile settings:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/settings/email - Update email address
router.put('/email', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Verify password before email change
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Update email
    user.email = email;
    user.isVerified = false; // Reset verification status
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email updated successfully. Please verify your new email address.'
    });
  } catch (err) {
    console.error('Error updating email:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/settings/password - Change password
router.put('/password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Error changing password:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/settings/notifications - Update notification preferences
router.put('/notifications', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { email, push, sms } = req.body;

    const updateData: any = {};
    if (typeof email === 'boolean') updateData['preferences.notifications.email'] = email;
    if (typeof push === 'boolean') updateData['preferences.notifications.push'] = push;
    if (typeof sms === 'boolean') updateData['preferences.notifications.sms'] = sms;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.preferences,
      message: 'Notification preferences updated successfully'
    });
  } catch (err) {
    console.error('Error updating notification preferences:', err);
    return handleAuthError(res, err);
  }
});

export default router; 