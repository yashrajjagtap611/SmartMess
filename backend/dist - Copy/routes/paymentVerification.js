"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const paymentVerificationService_1 = require("../services/paymentVerificationService");
const router = express_1.default.Router();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
/**
 * @route POST /api/payment-verification/create
 * @desc Create a new payment verification request
 * @access Private (User)
 */
router.post('/create', requireAuth_1.default, upload.single('paymentScreenshot'), async (req, res) => {
    try {
        const { messId, mealPlanId, amount, paymentMethod } = req.body;
        const userId = req.user?.id;
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
        const result = await paymentVerificationService_1.PaymentVerificationService.createPaymentVerification(data);
        return res.status(201).json(result);
    }
    catch (error) {
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
router.get('/mess-owner/:messId', requireAuth_1.default, async (req, res) => {
    try {
        const { messId } = req.params;
        const { status } = req.query;
        const result = await paymentVerificationService_1.PaymentVerificationService.getMessOwnerVerificationRequests(messId, status);
        return res.json(result);
    }
    catch (error) {
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
router.put('/:verificationId', requireAuth_1.default, async (req, res) => {
    try {
        const { verificationId } = req.params;
        const { status, rejectionReason } = req.body;
        const verifiedBy = req.user?.id;
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
        const result = await paymentVerificationService_1.PaymentVerificationService.updatePaymentVerification(verificationId, data);
        return res.json(result);
    }
    catch (error) {
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
router.get('/user', requireAuth_1.default, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        const result = await paymentVerificationService_1.PaymentVerificationService.getUserVerificationRequests(userId);
        return res.json(result);
    }
    catch (error) {
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
router.get('/stats/:messId', requireAuth_1.default, async (req, res) => {
    try {
        const { messId } = req.params;
        const result = await paymentVerificationService_1.PaymentVerificationService.getVerificationStats(messId);
        return res.json(result);
    }
    catch (error) {
        console.error('Error getting verification stats:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get verification statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=paymentVerification.js.map