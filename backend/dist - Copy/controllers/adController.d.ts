import { Request, Response, NextFunction } from 'express';
export declare class AdController {
    /**
     * Get ad settings (public)
     */
    static getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get active ad card for current user
     */
    static getActiveAdCard(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Record ad card impression
     */
    static recordAdCardImpression(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Record ad card click
     */
    static recordAdCardClick(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get ad credits balance (for mess owner)
     */
    static getCredits(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Purchase ad credits
     */
    static purchaseCredits(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Calculate target user count for filters
     */
    static calculateTargetUserCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get audience list (name + profile photo only)
     */
    static getAudienceList(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create ad campaign
     */
    static createCampaign(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get campaigns for mess owner or admin
     */
    static getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get campaign analytics
     */
    static getCampaignAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=adController.d.ts.map