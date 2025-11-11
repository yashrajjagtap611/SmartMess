import mongoose, { Document } from 'mongoose';
export interface IBilling extends Document {
    userId: mongoose.Types.ObjectId;
    messId: mongoose.Types.ObjectId;
    membershipId: mongoose.Types.ObjectId;
    billingPeriod: {
        startDate: Date;
        endDate: Date;
        period: 'daily' | 'weekly' | '15days' | 'monthly' | '3months' | '6months' | 'yearly';
    };
    subscription: {
        planId: mongoose.Types.ObjectId;
        planName: string;
        baseAmount: number;
        discountAmount: number;
        taxAmount: number;
        totalAmount: number;
    };
    payment: {
        status: 'pending' | 'paid' | 'failed' | 'overdue' | 'refunded' | 'cancelled';
        method?: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
        dueDate: Date;
        paidDate?: Date;
        transactionId?: string;
        gatewayResponse?: any;
    };
    adjustments: Array<{
        type: 'discount' | 'penalty' | 'leave_credit' | 'late_fee' | 'refund' | 'bonus';
        amount: number;
        reason: string;
        appliedBy: string;
        appliedDate: Date;
    }>;
    leaveCredits: Array<{
        leaveId: mongoose.Types.ObjectId;
        creditAmount: number;
        appliedDate: Date;
    }>;
    subscriptionExtension?: {
        extensionMeals: number;
        extensionDays: number;
        originalEndDate: Date;
        newEndDate: Date;
    };
    metadata: {
        generatedBy: 'system' | 'admin' | 'mess_owner';
        notes?: string;
        tags?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const Billing: mongoose.Model<IBilling, {}, {}, {}, mongoose.Document<unknown, {}, IBilling> & IBilling & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Billing;
//# sourceMappingURL=Billing.d.ts.map