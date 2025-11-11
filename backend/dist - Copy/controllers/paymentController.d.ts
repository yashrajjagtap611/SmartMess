import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare class PaymentController {
    /**
     * Get Razorpay configuration (key ID only, never expose secret)
     */
    getRazorpayConfig(req: Request, res: Response): Promise<Response>;
    /**
     * Create a payment order for credit purchase
     */
    createOrder(req: AuthRequest, res: Response): Promise<Response>;
    /**
     * Verify payment and credit the account
     */
    verifyPayment(req: AuthRequest, res: Response): Promise<Response>;
    /**
     * Get payment transaction details
     */
    getTransactionDetails(req: AuthRequest, res: Response): Promise<Response>;
    /**
     * Get payment history for the mess
     */
    getPaymentHistory(req: AuthRequest, res: Response): Promise<Response>;
    /**
     * Handle Razorpay webhook events
     */
    handleWebhook(req: Request, res: Response): Promise<Response>;
}
export declare const paymentController: PaymentController;
export {};
//# sourceMappingURL=paymentController.d.ts.map