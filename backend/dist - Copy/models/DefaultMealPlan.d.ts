import mongoose, { Document } from 'mongoose';
export interface IDefaultMealPlan extends Document {
    name: string;
    pricing: {
        amount: number;
        period: 'day' | 'week' | '15days' | 'month' | '3months' | '6months' | 'year';
    };
    mealType: string;
    mealsPerDay: number;
    mealOptions: {
        breakfast: boolean;
        lunch: boolean;
        dinner: boolean;
    };
    description: string;
    isActive: boolean;
    isDefault: boolean;
    leaveRules: {
        maxLeaveMeals: number;
        requireTwoHourNotice: boolean;
        noticeHours: number;
        minConsecutiveDays: number;
        extendSubscription: boolean;
        autoApproval: boolean;
        leaveLimitsEnabled: boolean;
        consecutiveLeaveEnabled: boolean;
        maxLeaveMealsEnabled: boolean;
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDefaultMealPlan, {}, {}, {}, mongoose.Document<unknown, {}, IDefaultMealPlan> & IDefaultMealPlan & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=DefaultMealPlan.d.ts.map