import express, { Request, Response } from 'express';
import multer from 'multer';
import requireAuth from '../middleware/requireAuth';
import { PaymentVerificationService } from '../services/paymentVerificationService';

const router: express.Router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * @route POST /api/payment-verification/create
 * @desc Create a new payment verification request
 * @access Private (User)
 */
router.post('/create', requireAuth, upload.single('paymentScreenshot'), async (req: Request, res: Response) => {
  try {
    const { messId, mealPlanId, amount, paymentMethod } = req.body;
    const userId = (req as any).user?.id;

    if (!userId || !messId || !mealPlanId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const data = {
      userId,
      messId,
      mealPlanId,
      amount: parseFloat(amount),
      paymentMethod,
      ...(req.file && { paymentScreenshot: req.file })
    };

    const result = await PaymentVerificationService.createPaymentVerification(data);
    
    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating payment verification:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment verification request'
    });
  }
});

/**
 * @route GET /api/payment-verification/mess-owner/:messId
 * @desc Get payment verification requests for mess owner
 * @access Private (Mess Owner)
 */
router.get('/mess-owner/:messId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { messId } = req.params;
    const { status } = req.query;

    const result = await PaymentVerificationService.getMessOwnerVerificationRequests(
      messId as string, 
      status as string
    );
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error getting verification requests:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get verification requests'
    });
  }
});

/**
 * @route PUT /api/payment-verification/:verificationId
 * @desc Update payment verification status
 * @access Private (Mess Owner)
 */
router.put('/:verificationId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { verificationId } = req.params;
    const { status, rejectionReason } = req.body;
    const verifiedBy = (req as any).user?.id;

    if (!status || !verifiedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting payment'
      });
    }

    const data = {
      status,
      rejectionReason,
      verifiedBy
    };

    const result = await PaymentVerificationService.updatePaymentVerification(
      verificationId as string, 
      data
    );
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error updating payment verification:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment verification'
    });
  }
});

/**
 * @route GET /api/payment-verification/user
 * @desc Get user's payment verification requests
 * @access Private (User)
 */
router.get('/user', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await PaymentVerificationService.getUserVerificationRequests(userId);
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error getting user verification requests:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user verification requests'
    });
  }
});

/**
 * @route GET /api/payment-verification/stats/:messId
 * @desc Get payment verification statistics for mess owner
 * @access Private (Mess Owner)
 */
router.get('/stats/:messId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { messId } = req.params;

    const result = await PaymentVerificationService.getVerificationStats(messId as string);
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error getting verification stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get verification statistics'
    });
  }
});

export default router;
