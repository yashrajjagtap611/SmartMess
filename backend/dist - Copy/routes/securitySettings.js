"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const SecuritySettings_1 = __importDefault(require("../models/SecuritySettings"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// GET /api/security-settings - Get security settings
router.get('/', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        logger_1.default.info('Getting security settings for user', { userId });
        // Find security settings in database
        let securitySettings = await SecuritySettings_1.default.findOne({ userId });
        // If no security settings exist, create default ones
        if (!securitySettings) {
            securitySettings = new SecuritySettings_1.default({
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
            logger_1.default.info('Created default security settings for user', { userId });
        }
        return res.status(200).json({
            success: true,
            message: 'Security settings retrieved successfully',
            data: {
                privacy: securitySettings.privacy,
                security: securitySettings.security
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting security settings', { error: error.message, userId: req.user?.id });
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// PUT /api/security-settings - Update security settings
router.put('/', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { privacy, security } = req.body;
        logger_1.default.info('Updating security settings for user', { userId, privacy, security });
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
        let existingSettings = await SecuritySettings_1.default.findOne({ userId });
        if (existingSettings) {
            // Update existing security settings
            if (privacy) {
                existingSettings.privacy = { ...existingSettings.privacy, ...privacy };
            }
            if (security) {
                existingSettings.security = { ...existingSettings.security, ...security };
            }
            await existingSettings.save();
            logger_1.default.info('Updated security settings for user', { userId });
        }
        else {
            // Create new security settings
            existingSettings = new SecuritySettings_1.default({
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
            logger_1.default.info('Created new security settings for user', { userId });
        }
        return res.status(200).json({
            success: true,
            message: 'Security settings updated successfully',
            data: {
                privacy: existingSettings.privacy,
                security: existingSettings.security
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating security settings', { error: error.message, userId: req.user?.id });
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// PUT /api/security-settings/password - Update password
router.put('/password', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { currentPassword, newPassword } = req.body;
        logger_1.default.info('Updating password for user', { userId });
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
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Verify current password
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        // Hash new password
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        user.password = hashedNewPassword;
        await user.save();
        logger_1.default.info('Password updated successfully for user', { userId });
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error updating password', { error: error.message, userId: req.user?.id });
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
exports.default = router;
//# sourceMappingURL=securitySettings.js.map