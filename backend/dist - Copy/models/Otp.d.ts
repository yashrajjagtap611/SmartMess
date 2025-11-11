import mongoose, { Document } from 'mongoose';
export interface IOtp extends Document {
    email: string;
    code: string;
    type: 'verification' | 'password_reset';
    expiresAt: Date;
    verified: boolean;
    invalidated: boolean;
    createdAt: Date;
}
declare const Otp: mongoose.Model<IOtp, {}, {}, {}, mongoose.Document<unknown, {}, IOtp> & IOtp & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Otp;
//# sourceMappingURL=Otp.d.ts.map