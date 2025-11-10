import mongoose, { Schema, Document, Types } from 'mongoose';

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
  mealBreakdown: { breakfast: number; lunch: number; dinner: number };

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

const SubscriptionExtensionTrackingSchema = new Schema<ISubscriptionExtensionTracking>({
  mealPlanId: { type: Schema.Types.ObjectId, ref: 'MealPlan', required: true },
  originalSubscriptionEndDate: { type: Date },
  newSubscriptionEndDate: { type: Date },
  extensionAppliedAt: { type: Date, default: Date.now }
}, { _id: true });

const PlanWiseBreakdownSchema = new Schema<IPlanWiseBreakdownItem>({
  planId: { type: String, required: true },
  planName: { type: String },
  breakfast: { type: Number, default: 0 },
  lunch: { type: Number, default: 0 },
  dinner: { type: Number, default: 0 },
  totalMealsMissed: { type: Number, default: 0 },
  estimatedSavings: { type: Number, default: 0 }
}, { _id: true });

const UserLeaveSchema = new Schema<IUserLeave>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messId: { type: Schema.Types.ObjectId, ref: 'MessProfile', required: true },
  mealPlanIds: [{ type: Schema.Types.ObjectId, ref: 'MealPlan', required: true }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  originalEndDate: { type: Date },
  mealTypes: [{ type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true }],
  reason: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'extended', 'cancelled'], default: 'pending' },

  totalMealsMissed: { type: Number, default: 0 },
  estimatedSavings: { type: Number, default: 0 },
  planWiseBreakdown: { type: [PlanWiseBreakdownSchema], default: [] },
  mealBreakdown: {
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 }
  },

  extendSubscription: { type: Boolean, default: false },
  extensionMeals: { type: Number, default: 0 },
  extensionDays: { type: Number, default: 0 },
  deductionEligibleMeals: { type: Number, default: 0 },
  deductionEligibleDays: { type: Number, default: 0 },
  nonDeductionMeals: { type: Number, default: 0 },
  subscriptionExtensionTracking: { type: [SubscriptionExtensionTrackingSchema], default: [] },

  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  approvalRemarks: { type: String }
}, {
  timestamps: true
});

UserLeaveSchema.index({ userId: 1, messId: 1, startDate: -1 });
UserLeaveSchema.index({ messId: 1, status: 1 });

export const UserLeave = (mongoose.models.UserLeave as mongoose.Model<IUserLeave>) || mongoose.model<IUserLeave>('UserLeave', UserLeaveSchema);

export default UserLeave;


