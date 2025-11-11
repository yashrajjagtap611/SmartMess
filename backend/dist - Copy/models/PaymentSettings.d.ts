import mongoose, { Document } from 'mongoose';
export interface IPaymentSettings extends Document {
    userId: mongoose.Types.ObjectId;
    upiId: string;
    bankAccount: string;
    autoPayment: boolean;
    lateFee: boolean;
    lateFeeAmount: number;
    isCashPayment: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const PaymentSettings: mongoose.Model<IPaymentSettings, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentSettings> & IPaymentSettings & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default PaymentSettings;
//# sourceMappingURL=PaymentSettings.d.ts.map