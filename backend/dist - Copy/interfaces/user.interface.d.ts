import { Request } from 'express';
export interface IUserProfile {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role?: string;
    address?: string;
    gender?: 'male' | 'female' | 'other';
    dob?: Date;
    profilePicture?: string;
    avatar?: string;
    status?: string;
    isVerified?: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IUserUpdate {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    gender?: 'male' | 'female' | 'other';
    dob?: Date;
    profilePicture?: string;
}
export interface IUserActivity {
    userId: string;
    action: string;
    timestamp: Date;
    details?: any;
}
export interface IUserAuthenticatedRequest extends Request {
    user?: {
        id: string;
        _id: string;
        email: string;
        role: string;
        isVerified: boolean;
    };
}
//# sourceMappingURL=user.interface.d.ts.map