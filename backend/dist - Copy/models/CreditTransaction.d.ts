import mongoose, { Document } from 'mongoose';
export interface ICreditTransaction extends Document {
    messId: mongoose.Types.ObjectId;
    type: 'purchase' | 'deduction' | 'bonus' | 'refund' | 'adjustment' | 'trial';
    amount: number;
    description: string;
    referenceId?: string;
    planId?: mongoose.Types.ObjectId;
    billingPeriod?: {
        startDate: Date;
        endDate: Date;
    };
    userCount?: number;
    creditsPerUser?: number;
    metadata?: Record<string, any>;
    processedBy?: mongoose.Types.ObjectId;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICreditTransaction, {}, {}, {}, mongoose.Document<unknown, {}, ICreditTransaction> & ICreditTransaction & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=CreditTransaction.d.ts.map