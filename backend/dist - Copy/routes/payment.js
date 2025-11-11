"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// Public routes (no authentication required)
// Get Razorpay configuration
router.get('/config', paymentController_1.paymentController.getRazorpayConfig);
// Webhook endpoint (no auth required, verified via signature)
router.post('/webhook', paymentController_1.paymentController.handleWebhook);
// Protected routes - Require authentication
router.use(middleware_1.auth);
// Create payment order
router.post('/create-order', paymentController_1.paymentController.createOrder);
// Verify payment
router.post('/verify', paymentController_1.paymentController.verifyPayment);
// Get transaction details
router.get('/transaction/:orderId', paymentController_1.paymentController.getTransactionDetails);
// Get payment history
router.get('/history', paymentController_1.paymentController.getPaymentHistory);
exports.default = router;
//# sourceMappingURL=payment.js.map