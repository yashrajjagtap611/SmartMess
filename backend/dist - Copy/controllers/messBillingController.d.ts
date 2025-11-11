import { Request, Response } from 'express';
export declare class MessBillingController {
    /**
     * Get comprehensive billing details (for dashboard)
     */
    getMessBillingDetails(req: Request, res: Response): Promise<Response>;
    /**
     * Toggle auto-renewal for a specific mess
     */
    toggleMessAutoRenewal(req: Request, res: Response): Promise<Response>;
    /**
     * Process monthly bill for a specific mess
     */
    processMessMonthlyBill(req: Request, res: Response): Promise<Response>;
    /**
     * Check credits for user addition for a specific mess
     */
    checkMessCreditsForUserAddition(req: Request, res: Response): Promise<Response>;
    /**
     * Get credit usage report for a specific mess
     */
    getMessCreditUsageReport(req: Request, res: Response): Promise<Response>;
    /**
     * Get billing history for a specific mess
     */
    getMessBillingHistory(req: Request, res: Response): Promise<Response>;
    /**
     * Get current bill preview for mess owner
     */
    getMyBillPreview(req: Request, res: Response): Promise<Response>;
    /**
     * Generate pending bill (manual billing trigger)
     */
    generateMyPendingBill(req: Request, res: Response): Promise<Response>;
    /**
     * Pay pending bill
     */
    payMyPendingBill(req: Request, res: Response): Promise<Response>;
    /**
     * Toggle auto-renewal
     */
    toggleAutoRenewal(req: Request, res: Response): Promise<Response>;
    /**
     * Check if sufficient credits for new user
     */
    checkCreditsForNewUser(req: Request, res: Response): Promise<Response>;
    /**
     * Get billing history
     */
    getMyBillingHistory(req: Request, res: Response): Promise<Response>;
    /**
     * Get credit usage report
     */
    getMyCreditUsageReport(req: Request, res: Response): Promise<Response>;
    /**
     * Check low credits warning
     */
    checkMyLowCredits(req: Request, res: Response): Promise<Response>;
    /**
     * Get my mess credits details
     */
    getMyCreditsDetails(req: Request, res: Response): Promise<Response>;
}
export declare const messBillingController: MessBillingController;
//# sourceMappingURL=messBillingController.d.ts.map