import { Request, Response, NextFunction } from 'express';
export declare class AdminController {
    static getDashboard(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getUserAnalytics(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getMessAnalytics(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getMembershipAnalytics(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getTrendAnalytics(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getUsers(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getUserDetails(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static updateUser(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static deleteUser(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getMesses(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getMessDetails(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static updateMess(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static deleteMess(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getSystemStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getSystemLogs(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static createBackup(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getBackupStatus(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static testEmail(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static toggleMaintenance(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMaintenanceStatus(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
export default AdminController;
//# sourceMappingURL=admin.d.ts.map