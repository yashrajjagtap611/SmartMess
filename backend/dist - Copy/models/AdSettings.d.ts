import mongoose, { Document, Model } from 'mongoose';
export interface IAdSettings extends Document {
    creditPricePerUserAdCard: number;
    creditPricePerUserMessaging: number;
    adCardDelaySeconds: number;
    googleAdsEnabled: boolean;
    policies: {
        maxAdDurationDays: number;
        maxImageSizeMB: number;
        maxVideoSizeMB: number;
        allowedImageFormats: string[];
        allowedVideoFormats: string[];
        maxTitleLength: number;
        maxDescriptionLength: number;
        requireApproval: boolean;
    };
    defaultAdCardDisplayDuration: number;
    defaultMessagingWindowHours: number;
    updatedBy: mongoose.Types.ObjectId;
    updatedAt: Date;
    createdAt: Date;
}
export interface IAdSettingsModel extends Model<IAdSettings> {
    getCurrentSettings(): Promise<IAdSettings>;
}
declare const _default: IAdSettingsModel;
export default _default;
//# sourceMappingURL=AdSettings.d.ts.map