import mongoose, { Document } from 'mongoose';
export interface IAdCampaign extends Document {
    messId: mongoose.Types.ObjectId;
    campaignType: 'ad_card' | 'messaging' | 'both';
    title: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    callToAction?: string;
    audienceFilters: {
        messIds?: mongoose.Types.ObjectId[];
        roles?: string[];
        genders?: string[];
        ageRange?: {
            min?: number;
            max?: number;
        };
        membershipStatus?: string[];
    };
    targetUserCount: number;
    actualReach: number;
    status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected';
    startDate: Date;
    endDate: Date;
    creditsRequired: number;
    creditsUsed: number;
    creditCostPerUser: number;
    messagingWindowStart?: Date;
    messagingWindowEnd?: Date;
    messagingRoomId?: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    impressions: number;
    clicks: number;
    messagesSent: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAdCampaign, {}, {}, {}, mongoose.Document<unknown, {}, IAdCampaign> & IAdCampaign & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=AdCampaign.d.ts.map