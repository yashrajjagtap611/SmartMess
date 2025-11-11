import mongoose, { Document } from 'mongoose';
export interface IAdAnalytics extends Document {
    campaignId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    eventType: 'impression' | 'click' | 'message_sent' | 'message_read';
    adType: 'ad_card' | 'messaging';
    timestamp: Date;
    metadata?: {
        deviceType?: string;
        userAgent?: string;
        referrer?: string;
        [key: string]: any;
    };
}
declare const _default: mongoose.Model<IAdAnalytics, {}, {}, {}, mongoose.Document<unknown, {}, IAdAnalytics> & IAdAnalytics & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=AdAnalytics.d.ts.map