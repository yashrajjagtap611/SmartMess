"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const messQRService_1 = __importDefault(require("../services/messQRService"));
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const router = (0, express_1.Router)();
// POST /api/mess-qr/generate - Generate or retrieve QR code for mess verification (Mess Owner only)
router.post('/generate', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { messId, forceRegenerate } = req.body;
        if (!messId) {
            return res.status(400).json({
                success: false,
                message: 'Mess ID is required'
            });
        }
        // Generate or retrieve existing QR code
        const result = await messQRService_1.default.generateMessVerificationQR(messId, userId, forceRegenerate || false);
        return res.status(200).json({
            success: true,
            message: result.isNew ? 'New QR code generated successfully' : 'Existing QR code retrieved',
            data: result
        });
    }
    catch (error) {
        console.error('Error generating mess QR code:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to generate QR code'
        });
    }
});
// DELETE /api/mess-qr/delete - Delete QR code for mess (Mess Owner only)
router.delete('/delete', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { messId } = req.body;
        if (!messId) {
            return res.status(400).json({
                success: false,
                message: 'Mess ID is required'
            });
        }
        // Delete QR code
        const result = await messQRService_1.default.deleteMessQR(messId, userId);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error deleting mess QR code:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete QR code'
        });
    }
});
// POST /api/mess-qr/verify-membership - User verifies their membership by scanning mess QR code
router.post('/verify-membership', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { qrCodeData } = req.body;
        if (!qrCodeData) {
            return res.status(400).json({
                success: false,
                message: 'QR code data is required'
            });
        }
        // Verify user's membership
        const result = await messQRService_1.default.verifyUserMembership(qrCodeData, userId);
        return res.status(200).json({
            success: result.isValid,
            message: result.message,
            data: result.member || null
        });
    }
    catch (error) {
        console.error('Error verifying membership:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/mess-qr/verify-user - Mess owner verifies a user's membership
router.post('/verify-user', requireAuth_1.default, async (req, res, _next) => {
    try {
        const messOwnerId = req.user.id;
        const { messId, targetUserId } = req.body;
        if (!messId || !targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'Mess ID and Target User ID are required'
            });
        }
        // Verify mess owner has permission
        const messProfile = await MessProfile_1.default.findOne({
            _id: messId,
            userId: messOwnerId
        });
        if (!messProfile) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to verify members for this mess'
            });
        }
        // Verify user membership
        const result = await messQRService_1.default.verifyUserByMessOwner(messId, messOwnerId, targetUserId);
        return res.status(200).json({
            success: result.isValid,
            message: result.message,
            data: result.member || null
        });
    }
    catch (error) {
        console.error('Error verifying user by mess owner:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/mess-qr/stats - Get verification statistics (Mess Owner only)
router.get('/stats', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const { messId } = req.query;
        if (!messId) {
            return res.status(400).json({
                success: false,
                message: 'Mess ID is required'
            });
        }
        const stats = await messQRService_1.default.getMessVerificationStats(messId, userId);
        return res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching verification stats:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/mess-qr/my-mess - Get mess owner's mess for QR generation
router.get('/my-mess', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const messProfile = await MessProfile_1.default.findOne({ userId }).select('_id name location qrCode');
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'No mess profile found. Please create a mess profile first.'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Mess profile retrieved successfully',
            data: messProfile
        });
    }
    catch (error) {
        console.error('Error fetching mess profile:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
exports.default = router;
//# sourceMappingURL=messQRVerification.js.map