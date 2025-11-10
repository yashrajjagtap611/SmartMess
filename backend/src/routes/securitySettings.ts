import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import SecuritySettings from '../models/SecuritySettings';

import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

const router: Router = Router();

// GET /api/security-settings - Get security settings
router.get('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        logger.info('Getting security settings for user', { userId });

    // Find security settings in database
    let securitySettings = await SecuritySettings.findOne({ userId });
    
    // If no security settings exist, create default ones
    if (!securitySettings) {
      securitySettings = new SecuritySettings({
        userId,
        privacy: {
          profileVisible: true,
          contactVisible: true,
          ratingsVisible: true
        },
        security: {
          twoFactorEnabled: false,
          loginNotifications: true,
          suspiciousActivityAlerts: true
        }
      });
      await securitySettings.save();
      logger.info('Created default security settings for user', { userId });
    }

    return res.status(200).json({
      success: true,
      message: 'Security settings retrieved successfully',
      data: {
        privacy: securitySettings.privacy,
        security: securitySettings.security
      }
    });

  } catch (error: any) {
    logger.error('Error getting security settings', { error: error.message, userId: (req as any).user?.id });
    return handleAuthError(res, error);
  }
});

// PUT /api/security-settings - Update security settings
router.put('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { privacy, security } = req.body;

    logger.info('Updating security settings for user', { userId, privacy, security });

    // Validate privacy settings if provided
    if (privacy) {
      if (typeof privacy.profileVisible !== 'boolean' || 
          typeof privacy.contactVisible !== 'boolean' || 
          typeof privacy.ratingsVisible !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid privacy settings format. All fields must be boolean values.'
        });
      }
    }

    // Validate security settings if provided
    if (security) {
      if (typeof security.twoFactorEnabled !== 'boolean' || 
          typeof security.loginNotifications !== 'boolean' || 
          typeof security.suspiciousActivityAlerts !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid security settings format. All fields must be boolean values.'
        });
      }
    }

    // Find existing security settings or create new ones
    let existingSettings = await SecuritySettings.findOne({ userId });
    
    if (existingSettings) {
      // Update existing security settings
      if (privacy) {
        existingSettings.privacy = { ...existingSettings.privacy, ...privacy };
      }
      if (security) {
        existingSettings.security = { ...existingSettings.security, ...security };
      }
      await existingSettings.save();
      logger.info('Updated security settings for user', { userId });
    } else {
      // Create new security settings
      existingSettings = new SecuritySettings({
        userId,
        privacy: privacy || {
          profileVisible: true,
          contactVisible: true,
          ratingsVisible: true
        },
        security: security || {
          twoFactorEnabled: false,
          loginNotifications: true,
          suspiciousActivityAlerts: true
        }
      });
      await existingSettings.save();
      logger.info('Created new security settings for user', { userId });
    }

    return res.status(200).json({
      success: true,
      message: 'Security settings updated successfully',
      data: {
        privacy: existingSettings.privacy,
        security: existingSettings.security
      }
    });

  } catch (error: any) {
    logger.error('Error updating security settings', { error: error.message, userId: (req as any).user?.id });
    return handleAuthError(res, error);
  }
});

// PUT /api/security-settings/password - Update password
router.put('/password', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { currentPassword, newPassword } = req.body;

    logger.info('Updating password for user', { userId });

    // Validate input
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

    // Find user and verify current password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    logger.info('Password updated successfully for user', { userId });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error: any) {
    logger.error('Error updating password', { error: error.message, userId: (req as any).user?.id });
    return handleAuthError(res, error);
  }
});

export default router;

