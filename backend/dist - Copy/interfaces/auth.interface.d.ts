import { Request } from 'express';
export interface IUser {
    _id: string;
    email: string;
    password: string;
    role: 'user' | 'mess_owner' | 'admin';
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ILoginRequest {
    email: string;
    password: string;
}
export interface IRegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    role: 'user' | 'mess_owner';
}
export interface IResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}
export interface IForgotPasswordRequest {
    email: string;
}
export interface IGoogleAuthRequest {
    token: string;
}
export interface IChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface IOtpRequest {
    email: string;
}
export interface IVerifyOtpRequest {
    email: string;
    otp?: string;
    code?: string;
}
export interface IAuthResponse {
    success: boolean;
    message: string;
    data?: {
        token?: string;
        user?: {
            _id: string;
            email: string;
            role: string;
            isVerified: boolean;
        };
    };
}
export interface IAuthenticatedRequest extends Request {
    user?: {
        id: string;
        _id: string;
        email: string;
        role: string;
        isVerified: boolean;
    };
}
export interface IJwtPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=auth.interface.d.ts.map