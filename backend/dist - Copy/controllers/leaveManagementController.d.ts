import { Request, Response } from 'express';
export declare const getLeaveRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLeaveRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const processLeaveRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const processExtensionRequest: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLeaveStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=leaveManagementController.d.ts.map