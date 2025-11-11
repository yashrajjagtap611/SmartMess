import mongoose, { Document } from 'mongoose';
export interface ITransaction extends Document {
    transactionId: string;
    userId: mongoose.Types.ObjectId;
    messId: mongoose.Types.ObjectId;
    membershipId?: mongoose.Types.ObjectId;
    billingId?: mongoose.Types.ObjectId;
    subscriptionId?: mongoose.Types.ObjectId;
    type: 'payment' | 'refund' | 'adjustment' | 'subscription' | 'leave_credit';
    amount: number;
    currency: string;
    status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
    paymentMethod: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
    gateway: {
        name: string;
        transactionId?: string;
        gatewayResponse?: any;
        webhookData?: any;
    };
    description: string;
    metadata: {
        ipAddress?: string;
        userAgent?: string;
        deviceInfo?: any;
        location?: {
            latitude?: number;
            longitude?: number;
            city?: string;
            state?: string;
            country?: string;
        };
        notes?: string;
        tags?: string[];
    };
    refund?: {
        refundId?: string;
        refundAmount: number;
        refundReason: string;
        refundedAt?: Date;
        refundedBy: mongoose.Types.ObjectId;
        gatewayRefundId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction> & ITransaction & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Transaction;
//# sourceMappingURL=Transaction.d.ts.map