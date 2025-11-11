import mongoose, { Document } from 'mongoose';
export interface IDefaultOffDaySettings extends Document {
    messId: mongoose.Types.ObjectId;
    pattern: 'weekly' | 'monthly';
    weeklySettings?: {
        dayOfWeek: number;
        enabled: boolean;
        mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
    };
    monthlySettings?: {
        daysOfMonth: number[];
        enabled: boolean;
        mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
    };
    billingDeduction: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const DefaultOffDaySettings: mongoose.Model<IDefaultOffDaySettings, {}, {}, {}, mongoose.Document<unknown, {}, IDefaultOffDaySettings> & IDefaultOffDaySettings & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default DefaultOffDaySettings;
//# sourceMappingURL=DefaultOffDaySettings.d.ts.map