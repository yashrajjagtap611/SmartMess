import { Request, Response, NextFunction } from 'express';
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireAdminPermission: (_permission: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const preventSelfModification: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const preventSelfDeletion: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const preventSelfRoleChange: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const logAdminAction: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const checkMaintenanceMode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const adminRateLimiter: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateAdminInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const addAdminContext: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    requireAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    requireAdminPermission: (_permission: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    preventSelfModification: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    preventSelfDeletion: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    preventSelfRoleChange: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    logAdminAction: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkMaintenanceMode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    adminRateLimiter: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    validateAdminInput: (req: Request, res: Response, next: NextFunction) => void;
    addAdminContext: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
//# sourceMappingURL=admin.d.ts.map