import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
/**
 * Middleware to check if mess has active subscription
 */
export declare const checkSubscription: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response>;
/**
 * Middleware to check if mess can accept new users
 */
export declare const checkCanAcceptUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response>;
/**
 * Middleware to check if mess can add meals
 */
export declare const checkCanAddMeals: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response>;
export {};
//# sourceMappingURL=checkSubscription.d.ts.map