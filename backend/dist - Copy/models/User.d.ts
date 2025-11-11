import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'mess-owner' | 'admin';
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    messPhotoUrl?: string;
    profilePicture?: string;
    lastLogin?: Date;
    status?: 'active' | 'suspended';
    address?: string;
    currentAddress?: {
        street?: string;
        city?: string;
        district?: string;
        taluka?: string;
        state?: string;
        pincode?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
    };
    gender?: 'male' | 'female' | 'other';
    dob?: Date;
    joinDate?: Date;
    messId?: mongoose.Types.ObjectId;
    isActive?: boolean;
    mealPlan?: {
        breakfastPrice?: number;
        lunchPrice?: number;
        dinnerPrice?: number;
    };
    preferences?: {
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        privacy: {
            profileVisibility: 'public' | 'private' | 'mess-only';
            showEmail: boolean;
            showPhone: boolean;
        };
        theme: 'light' | 'dark' | 'auto';
        language: string;
        dietary?: string[];
        allergies?: string[];
        mealTimes?: {
            breakfast?: string;
            lunch?: string;
            dinner?: string;
        };
    };
    isStudent?: boolean;
    studentInfo?: {
        college?: string;
        course?: string;
        year?: string;
        branch?: string;
        collegeEmailId?: string;
    };
    isWorking?: boolean;
    professionInfo?: {
        company?: string;
        designation?: string;
        department?: string;
        workExperience?: number;
        workLocation?: string;
        employeeId?: string;
        joiningDate?: Date;
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map