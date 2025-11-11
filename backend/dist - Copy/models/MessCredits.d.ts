import mongoose, { Document } from 'mongoose';
export interface IMessCredits extends Document {
    messId: mongoose.Types.ObjectId;
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
    lastBillingDate?: Date;
    nextBillingDate?: Date;
    isTrialActive: boolean;
    trialStartDate?: Date;
    trialEndDate?: Date;
    trialCreditsUsed: number;
    monthlyUserCount: number;
    lastUserCountUpdate: Date;
    status: 'active' | 'suspended' | 'trial' | 'expired';
    autoRenewal: boolean;
    lastBillingAmount?: number;
    pendingBillAmount?: number;
    lowCreditThreshold: number;
    createdAt: Date;
    updatedAt: Date;
    addCredits(amount: number): Promise<void>;
    deductCredits(amount: number): Promise<void>;
    isTrialExpired(): boolean;
    hasActiveService(): boolean;
}
declare const _default: mongoose.Model<IMessCredits, {}, {}, {}, mongoose.Document<unknown, {}, IMessCredits> & IMessCredits & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=MessCredits.d.ts.map