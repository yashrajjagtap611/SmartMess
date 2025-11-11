import mongoose, { Document } from 'mongoose';
export interface IBillingAdjustment extends Document {
    userId: mongoose.Types.ObjectId;
    leaveId: mongoose.Types.ObjectId;
    originalAmount: number;
    adjustedAmount: number;
    creditAmount: number;
    adjustmentDate: Date;
    adjustmentReason: string;
    status: 'pending' | 'applied' | 'reversed';
    appliedAt?: Date;
    reversedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const BillingAdjustment: mongoose.Model<IBillingAdjustment, {}, {}, {}, mongoose.Document<unknown, {}, IBillingAdjustment> & IBillingAdjustment & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=BillingAdjustment.d.ts.map