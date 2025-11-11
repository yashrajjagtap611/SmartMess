import mongoose, { Document } from 'mongoose';
export interface IPaymentTransaction extends Document {
    messId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    orderId: string;
    paymentId?: string;
    signature?: string;
    amount: number;
    currency: string;
    credits: number;
    bonusCredits: number;
    totalCredits: number;
    status: 'created' | 'pending' | 'success' | 'failed' | 'refunded';
    paymentMethod?: string;
    errorCode?: string;
    errorDescription?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPaymentTransaction, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentTransaction> & IPaymentTransaction & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=PaymentTransaction.d.ts.map