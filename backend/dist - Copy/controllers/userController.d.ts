import { Request, Response } from 'express';
export declare class UserController {
    static getProfile(req: Request, res: Response): Promise<Response>;
    static uploadAvatar(req: Request, res: Response): Promise<Response>;
    static updateProfile(req: Request, res: Response): Promise<Response>;
    static getActivity(req: Request, res: Response): Promise<Response>;
    static changePassword(req: Request, res: Response): Promise<Response>;
}
export default UserController;
//# sourceMappingURL=userController.d.ts.map