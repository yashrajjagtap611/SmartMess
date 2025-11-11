import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getMessOffDays: (req: AuthRequest, res: Response, _next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const createMessOffDay: (req: AuthRequest, res: Response, _next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const updateMessOffDay: (req: AuthRequest, res: Response, _next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const deleteMessOffDay: (req: AuthRequest, res: Response, _next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const getMessOffDayStats: (req: AuthRequest, res: Response, _next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const getDefaultOffDaySettings: (req: AuthRequest, res: Response, _next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const saveDefaultOffDaySettings: (req: AuthRequest, res: Response, _next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=messOffDayController.d.ts.map