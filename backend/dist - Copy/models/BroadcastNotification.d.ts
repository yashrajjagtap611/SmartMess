import mongoose, { Document } from 'mongoose';
export type BroadcastAudience = 'all' | 'role' | 'mess_members';
export type BroadcastPriority = 'low' | 'normal' | 'high';
export interface IReadEntry {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
}
export interface IBroadcastNotification extends Document {
    audience: BroadcastAudience;
    roles?: Array<'user' | 'mess-owner' | 'admin'>;
    messId?: mongoose.Types.ObjectId;
    type: 'join_request' | 'payment_request' | 'payment_received' | 'leave_request' | 'bill_due' | 'meal_plan_change' | 'general';
    title: string;
    message: string;
    priority: BroadcastPriority;
    startAt: Date;
    expiresAt?: Date;
    reads: IReadEntry[];
    data?: Record<string, any>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const BroadcastNotification: mongoose.Model<IBroadcastNotification, {}, {}, {}, mongoose.Document<unknown, {}, IBroadcastNotification> & IBroadcastNotification & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default BroadcastNotification;
//# sourceMappingURL=BroadcastNotification.d.ts.map