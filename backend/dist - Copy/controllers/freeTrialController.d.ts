import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare class FreeTrialController {
    /**
     * Activate free trial for a mess owner
     */
    activateFreeTrial(req: AuthRequest, res: Response): Promise<Response>;
    /**
     * Check if free trial is available for current user
     */
    checkTrialAvailability(req: AuthRequest, res: Response): Promise<Response>;
}
export declare const freeTrialController: FreeTrialController;
export {};
//# sourceMappingURL=freeTrialController.d.ts.map