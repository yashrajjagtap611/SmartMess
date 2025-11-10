import express from 'express';
import { paymentController } from '../controllers/paymentController';
import { auth } from '../middleware';

const router: express.Router = express.Router();

// Public routes (no authentication required)
// Get Razorpay configuration
router.get('/config', paymentController.getRazorpayConfig);

// Webhook endpoint (no auth required, verified via signature)
router.post('/webhook', paymentController.handleWebhook);

// Protected routes - Require authentication
router.use(auth);

// Create payment order
router.post('/create-order', paymentController.createOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

// Get transaction details
router.get('/transaction/:orderId', paymentController.getTransactionDetails);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

export default router;

