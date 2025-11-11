import mongoose, { Document } from 'mongoose';
export interface IMessOffDay extends Document {
    messId: mongoose.Types.ObjectId;
    offDate: Date;
    reason: string;
    mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
    billingDeduction: boolean;
    subscriptionExtension: boolean;
    extensionDays?: number;
    status: 'active' | 'cancelled';
    isRange?: boolean;
    rangeStartDate?: Date;
    rangeEndDate?: Date;
    startDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
    endDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const MessOffDay: mongoose.Model<IMessOffDay, {}, {}, {}, mongoose.Document<unknown, {}, IMessOffDay> & IMessOffDay & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default MessOffDay;
//# sourceMappingURL=MessOffDay.d.ts.map