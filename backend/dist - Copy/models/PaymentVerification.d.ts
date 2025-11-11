import mongoose, { Document } from 'mongoose';
export interface IPaymentVerification extends Document {
    userId: mongoose.Types.ObjectId;
    messId: mongoose.Types.ObjectId;
    membershipId: mongoose.Types.ObjectId;
    mealPlanId: mongoose.Types.ObjectId;
    amount: number;
    paymentMethod: 'upi' | 'online' | 'cash';
    paymentScreenshot?: string;
    transactionId?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const PaymentVerification: mongoose.Model<IPaymentVerification, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentVerification> & IPaymentVerification & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default PaymentVerification;
//# sourceMappingURL=PaymentVerification.d.ts.map