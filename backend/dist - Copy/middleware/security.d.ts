import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const corsOptions: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export declare const compressionMiddleware: any;
export declare const createRateLimiter: (options: {
    windowMs?: number;
    max?: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
}) => import("express-rate-limit").RateLimitRequestHandler;
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityMiddleware: any[];
declare const _default: any;
export default _default;
//# sourceMappingURL=security.d.ts.map