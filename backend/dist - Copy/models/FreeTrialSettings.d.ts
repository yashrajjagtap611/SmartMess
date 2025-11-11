import mongoose, { Document } from 'mongoose';
export interface IFreeTrialSettings extends Document {
    isGloballyEnabled: boolean;
    defaultTrialDurationDays: number;
    trialCredits: number;
    allowedFeatures: string[];
    restrictedFeatures: string[];
    maxTrialsPerMess: number;
    cooldownPeriodDays: number;
    autoActivateOnRegistration: boolean;
    requiresApproval: boolean;
    notificationSettings: {
        sendWelcomeEmail: boolean;
        sendReminderEmails: boolean;
        reminderDays: number[];
        sendExpiryNotification: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    updatedBy: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<IFreeTrialSettings, {}, {}, {}, mongoose.Document<unknown, {}, IFreeTrialSettings> & IFreeTrialSettings & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=FreeTrialSettings.d.ts.map