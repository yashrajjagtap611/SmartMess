import mongoose, { Document } from 'mongoose';
export interface IMessLocation {
    street: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
    country: string;
    latitude?: number;
    longitude?: number;
}
export interface IMessProfile extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    location: IMessLocation;
    colleges: string[];
    ownerPhone: string;
    ownerEmail: string;
    types: string[];
    logo: string | null;
    operatingHours: {
        meal: string;
        enabled: boolean;
        start: string;
        end: string;
    }[];
    qrCode?: {
        image: string;
        data: string;
        generatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const MessProfile: mongoose.Model<IMessProfile, {}, {}, {}, mongoose.Document<unknown, {}, IMessProfile> & IMessProfile & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default MessProfile;
//# sourceMappingURL=MessProfile.d.ts.map