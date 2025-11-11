import mongoose, { Document } from 'mongoose';
export interface IMessLeave extends Document {
    messId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    leaveType: 'holiday' | 'maintenance' | 'personal' | 'emergency' | 'seasonal' | 'other';
    reason?: string;
    mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
    isRecurring: boolean;
    recurringPattern?: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval: number;
        daysOfWeek?: number[];
        endDate?: Date;
        occurrences?: number;
    };
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    notificationsSent: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    affectedUsers: number;
    estimatedSavings?: number;
}
export declare const MessLeave: mongoose.Model<IMessLeave, {}, {}, {}, mongoose.Document<unknown, {}, IMessLeave> & IMessLeave & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=MessLeave.d.ts.map