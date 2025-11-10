export interface MealPlan {
  _id?: string;
  name: string;
  pricing: {
    amount: number;
    period: "day" | "week" | "15days" | "month" | "3months" | "6months" | "year";
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
  leaveRules: LeaveRules;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaveRules {
  maxLeaveMeals: number;
  requireTwoHourNotice: boolean;
  noticeHours: number;
  minConsecutiveDays: number;
  extendSubscription: boolean;
  autoApproval: boolean;
  leaveLimitsEnabled: boolean;
  consecutiveLeaveEnabled: boolean;
  maxLeaveMealsEnabled: boolean;
}

export interface MealPlanFormData {
  name: string;
  pricing: {
    amount: number;
    period: "day" | "week" | "15days" | "month" | "3months" | "6months" | "year";
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
  leaveRules: LeaveRules;
}

export interface MealPlanErrors {
  name: string;
  pricing: string;
  mealType: string;
  mealsPerDay: string;
  mealOptions: string;
  description: string;
  maxLeaveMeals: string;
  noticeHours: string;
  minConsecutiveDays: string;
  [key: string]: string; // Add index signature to make it compatible with Record<string, string>
}

export interface MealPlanState {
  mealPlans: MealPlan[];
  isLoading: boolean;
  error: string | null;
  deletingPlanId: string | null;
  currentPlan: MealPlan | null;
}

export interface MealPlanProps {
  onMealPlanCreate?: (data: MealPlanFormData) => void;
  onMealPlanUpdate?: (id: string, data: MealPlanFormData) => void;
  onMealPlanDelete?: (id: string) => void;
}

export interface MealPlanFormProps {
  planId?: string;
  onSave?: (data: MealPlanFormData) => void;
  onCancel?: () => void;
}

export interface MessPlansProps {
  onMealPlanEdit?: (plan: MealPlan) => void;
  onMealPlanDelete?: (id: string) => void;
  onMealPlanCreate?: (data: MealPlanFormData) => void;
  onMealPlanUpdate?: (id: string, data: MealPlanFormData) => void;
}

export interface LeaveRequestRulesProps {
  leaveRules: LeaveRules;
  errors: Record<string, string>;
  onLeaveRuleChange: (field: keyof LeaveRules, value: any) => void;
}

export interface MealPlanConfig {
  mealTypes: string[];
  pricingPeriods: Array<{ value: string; label: string }>;
  mealsPerDayOptions: number[];
  mealOptions: Array<{ value: string; label: string }>;
  maxLeaveMealsLimit: number;
  minNoticeHours: number;
  maxNoticeHours: number;
}
