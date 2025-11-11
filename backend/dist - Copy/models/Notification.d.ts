import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    messId?: mongoose.Types.ObjectId;
    type: 'join_request' | 'payment_request' | 'payment_received' | 'payment_reminder' | 'payment_overdue' | 'payment_success' | 'payment_failed' | 'leave_request' | 'leave_extension' | 'bill_due' | 'meal_plan_change' | 'general' | 'subscription_renewal' | 'payment_method_update' | 'mess_off_day';
    title: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    data?: {
        requestingUserId?: mongoose.Types.ObjectId;
        mealPlanId?: mongoose.Types.ObjectId;
        paymentType?: 'pay_now' | 'pay_later';
        amount?: number;
        plan?: string;
        approvedBy?: mongoose.Types.ObjectId;
        approvedAt?: string;
        rejectedBy?: mongoose.Types.ObjectId;
        rejectedAt?: string;
        paymentMethod?: string;
        dueDate?: string;
        reminderCount?: number;
        lastReminderSent?: string;
        paymentAttempts?: number;
        [key: string]: any;
    };
    isRead: boolean;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface INotificationModel extends mongoose.Model<INotification> {
    findExistingNotification: (userId: mongoose.Types.ObjectId, type: string, messId?: mongoose.Types.ObjectId) => Promise<INotification | null>;
}
declare const Notification: INotificationModel;
export default Notification;
//# sourceMappingURL=Notification.d.ts.map