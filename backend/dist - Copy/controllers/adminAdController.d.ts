import { Request, Response, NextFunction } from 'express';
export declare class AdminAdController {
    /**
     * Get ad settings (admin)
     */
    static getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update ad settings
     */
    static updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all campaigns (admin)
     */
    static getAllCampaigns(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Approve campaign
     */
    static approveCampaign(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reject campaign
     */
    static rejectCampaign(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get ad analytics (admin)
     */
    static getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=adminAdController.d.ts.map