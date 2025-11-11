import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response>;
    static login(req: Request, res: Response): Promise<Response>;
    static verifyOtp(req: Request, res: Response): Promise<Response>;
    static resendOtp(req: Request, res: Response): Promise<Response>;
    static forgotPassword(req: Request, res: Response): Promise<Response>;
    static verifyResetOtp(req: Request, res: Response): Promise<Response>;
    static resetPassword(req: Request, res: Response): Promise<Response>;
    static logout(req: Request, res: Response): Promise<Response>;
    static getProfile(req: Request, res: Response): Promise<Response>;
}
export default AuthController;
//# sourceMappingURL=authController.d.ts.map