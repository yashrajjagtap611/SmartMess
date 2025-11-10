import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import messQRService from '../services/messQRService';
import MessProfile from '../models/MessProfile';

const router: Router = Router();

// POST /api/mess-qr/generate - Generate or retrieve QR code for mess verification (Mess Owner only)
router.post('/generate', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { messId, forceRegenerate } = req.body;

    if (!messId) {
      return res.status(400).json({
        success: false,
        message: 'Mess ID is required'
      });
    }

    // Generate or retrieve existing QR code
    const result = await messQRService.generateMessVerificationQR(messId, userId, forceRegenerate || false);

    return res.status(200).json({
      success: true,
      message: result.isNew ? 'New QR code generated successfully' : 'Existing QR code retrieved',
      data: result
    });

  } catch (error: any) {
    console.error('Error generating mess QR code:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate QR code'
    });
  }
});

// DELETE /api/mess-qr/delete - Delete QR code for mess (Mess Owner only)
router.delete('/delete', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { messId } = req.body;

    if (!messId) {
      return res.status(400).json({
        success: false,
        message: 'Mess ID is required'
      });
    }

    // Delete QR code
    const result = await messQRService.deleteMessQR(messId, userId);

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error: any) {
    console.error('Error deleting mess QR code:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete QR code'
    });
  }
});

// POST /api/mess-qr/verify-membership - User verifies their membership by scanning mess QR code
router.post('/verify-membership', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Verify user's membership
    const result = await messQRService.verifyUserMembership(qrCodeData, userId);

    return res.status(200).json({
      success: result.isValid,
      message: result.message,
      data: result.member || null
    });

  } catch (error: any) {
    console.error('Error verifying membership:', error);
    return handleAuthError(res, error);
  }
});

// POST /api/mess-qr/verify-user - Mess owner verifies a user's membership
router.post('/verify-user', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const messOwnerId = (req as any).user.id;
    const { messId, targetUserId } = req.body;

    if (!messId || !targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Mess ID and Target User ID are required'
      });
    }

    // Verify mess owner has permission
    const messProfile = await MessProfile.findOne({
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
    const result = await messQRService.verifyUserByMessOwner(messId, messOwnerId, targetUserId);

    return res.status(200).json({
      success: result.isValid,
      message: result.message,
      data: result.member || null
    });

  } catch (error: any) {
    console.error('Error verifying user by mess owner:', error);
    return handleAuthError(res, error);
  }
});

// GET /api/mess-qr/stats - Get verification statistics (Mess Owner only)
router.get('/stats', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { messId } = req.query;

    if (!messId) {
      return res.status(400).json({
        success: false,
        message: 'Mess ID is required'
      });
    }

    const stats = await messQRService.getMessVerificationStats(messId as string, userId);

    return res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });

  } catch (error: any) {
    console.error('Error fetching verification stats:', error);
    return handleAuthError(res, error);
  }
});

// GET /api/mess-qr/my-mess - Get mess owner's mess for QR generation
router.get('/my-mess', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const messProfile = await MessProfile.findOne({ userId }).select('_id name location qrCode');

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

  } catch (error: any) {
    console.error('Error fetching mess profile:', error);
    return handleAuthError(res, error);
  }
});

export default router;
