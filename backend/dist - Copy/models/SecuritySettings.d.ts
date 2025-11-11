import mongoose, { Document } from 'mongoose';
export interface ISecuritySettings extends Document {
    userId: mongoose.Types.ObjectId;
    privacy: {
        profileVisible: boolean;
        contactVisible: boolean;
        ratingsVisible: boolean;
    };
    security: {
        twoFactorEnabled: boolean;
        loginNotifications: boolean;
        suspiciousActivityAlerts: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const SecuritySettings: mongoose.Model<ISecuritySettings, {}, {}, {}, mongoose.Document<unknown, {}, ISecuritySettings> & ISecuritySettings & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default SecuritySettings;
//# sourceMappingURL=SecuritySettings.d.ts.map