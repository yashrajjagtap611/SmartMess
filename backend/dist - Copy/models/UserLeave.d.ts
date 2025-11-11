import mongoose, { Document, Types } from 'mongoose';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'extended' | 'cancelled';
export interface ISubscriptionExtensionTracking {
    mealPlanId: Types.ObjectId;
    originalSubscriptionEndDate?: Date;
    newSubscriptionEndDate?: Date;
    extensionAppliedAt?: Date;
}
export interface IPlanWiseBreakdownItem {
    planId: string;
    planName?: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    totalMealsMissed: number;
    estimatedSavings: number;
}
export interface IUserLeave extends Document {
    userId: Types.ObjectId;
    messId: Types.ObjectId;
    mealPlanIds: Types.ObjectId[];
    startDate: Date;
    endDate: Date;
    originalEndDate?: Date;
    mealTypes: MealType[];
    reason?: string;
    status: LeaveStatus;
    totalMealsMissed: number;
    estimatedSavings: number;
    planWiseBreakdown: IPlanWiseBreakdownItem[];
    mealBreakdown: {
        breakfast: number;
        lunch: number;
        dinner: number;
    };
    extendSubscription?: boolean;
    extensionMeals?: number;
    extensionDays?: number;
    deductionEligibleMeals?: number;
    deductionEligibleDays?: number;
    nonDeductionMeals?: number;
    subscriptionExtensionTracking?: ISubscriptionExtensionTracking[];
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    approvalRemarks?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserLeave: mongoose.Model<IUserLeave, {}, {}, {}, mongoose.Document<unknown, {}, IUserLeave> & IUserLeave & {
    _id: Types.ObjectId;
}, any>;
export default UserLeave;
//# sourceMappingURL=UserLeave.d.ts.map