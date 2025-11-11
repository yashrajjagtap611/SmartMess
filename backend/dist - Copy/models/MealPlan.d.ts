import mongoose, { Document } from 'mongoose';
export interface IMealPlan extends Document {
    messId: string;
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
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMealPlan, {}, {}, {}, mongoose.Document<unknown, {}, IMealPlan> & IMealPlan & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=MealPlan.d.ts.map