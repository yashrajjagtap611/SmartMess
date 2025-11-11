import { Request, Response } from 'express';
export declare class CreditManagementController {
    createCreditSlab(req: Request, res: Response): Promise<Response>;
    getCreditSlabs(req: Request, res: Response): Promise<Response>;
    updateCreditSlab(req: Request, res: Response): Promise<Response>;
    deleteCreditSlab(req: Request, res: Response): Promise<Response>;
    createCreditPurchasePlan(req: Request, res: Response): Promise<Response>;
    getCreditPurchasePlans(req: Request, res: Response): Promise<Response>;
    updateCreditPurchasePlan(req: Request, res: Response): Promise<Response>;
    deleteCreditPurchasePlan(req: Request, res: Response): Promise<Response>;
    getMessCredits(req: Request, res: Response): Promise<Response>;
    purchaseCredits(req: Request, res: Response): Promise<Response>;
    adjustCredits(req: Request, res: Response): Promise<Response>;
    getFreeTrialSettings(req: Request, res: Response): Promise<Response>;
    updateFreeTrialSettings(req: Request, res: Response): Promise<Response>;
    activateFreeTrial(req: Request, res: Response): Promise<Response>;
    getCreditTransactions(req: Request, res: Response): Promise<Response>;
    getCreditAnalytics(req: Request, res: Response): Promise<Response>;
}
export declare const creditManagementController: CreditManagementController;
//# sourceMappingURL=creditManagementController.d.ts.map