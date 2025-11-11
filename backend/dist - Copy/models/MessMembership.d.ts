import mongoose, { Document } from 'mongoose';
export interface IMessMembership extends Document {
    userId: mongoose.Types.ObjectId;
    messId: mongoose.Types.ObjectId;
    mealPlanId: mongoose.Types.ObjectId;
    joinDate: Date;
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    leaveExtensionMeals?: number;
    requestExpiryDate?: Date;
    paymentStatus: 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded';
    paymentRequestStatus: 'none' | 'sent' | 'approved' | 'rejected';
    paymentType: 'pay_now' | 'pay_later' | 'subscription';
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    paymentDueDate?: Date;
    paymentAmount: number;
    lateFees?: number;
    paymentHistory: Array<{
        date: Date;
        amount: number;
        method: string;
        status: 'success' | 'failed' | 'pending' | 'refunded';
        transactionId?: string;
        notes?: string;
    }>;
    reminderSentCount: number;
    lastReminderSent?: Date;
    autoRenewal: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const MessMembership: mongoose.Model<IMessMembership, {}, {}, {}, mongoose.Document<unknown, {}, IMessMembership> & IMessMembership & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default MessMembership;
//# sourceMappingURL=MessMembership.d.ts.map