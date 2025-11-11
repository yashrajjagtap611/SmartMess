import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare class SubscriptionCheckController {
    /**
     * Get subscription status for current mess owner
     */
    getSubscriptionStatus(req: AuthRequest, res: Response): Promise<Response>;
    /**
     * Check if can access a specific module
     */
    checkModuleAccess(req: AuthRequest, res: Response): Promise<Response>;
}
export declare const subscriptionCheckController: SubscriptionCheckController;
export {};
//# sourceMappingURL=subscriptionCheckController.d.ts.map