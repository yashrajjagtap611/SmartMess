export interface DefaultMealPlan {
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
  isDefault: boolean;
  leaveRules: LeaveRules;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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

export interface DefaultMealPlanFormData {
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

export interface DefaultMealPlanErrors {
  name: string;
  pricing: string;
  mealType: string;
  mealsPerDay: string;
  mealOptions: string;
  description: string;
  minConsecutiveDays: string;
  [key: string]: string;
}

export interface DefaultMealPlanState {
  defaultMealPlans: DefaultMealPlan[];
  isLoading: boolean;
  error: string | null;
  deletingPlanId: string | null;
  currentPlan: DefaultMealPlan | null;
  generatingForMess: boolean;
  generatingForAllMesses: boolean;
}

export interface DefaultMealPlanProps {
  onDefaultMealPlanCreate?: (data: DefaultMealPlanFormData) => void;
  onDefaultMealPlanUpdate?: (id: string, data: DefaultMealPlanFormData) => void;
  onDefaultMealPlanDelete?: (id: string) => void;
}

export interface DefaultMealPlanFormProps {
  planId?: string;
  onSave?: (data: DefaultMealPlanFormData) => void;
  onCancel?: () => void;
}

export interface DefaultMealPlansListProps {
  onDefaultMealPlanEdit?: (plan: DefaultMealPlan) => void;
  onDefaultMealPlanDelete?: (id: string) => void;
  onDefaultMealPlanCreate?: (data: DefaultMealPlanFormData) => void;
  onDefaultMealPlanUpdate?: (id: string, data: DefaultMealPlanFormData) => void;
  onGenerateForMess?: (messId: string) => void;
  onGenerateForAllMesses?: () => void;
}

export interface LeaveRequestRulesProps {
  leaveRules: LeaveRules;
  errors: Record<string, string>;
  onLeaveRuleChange: (field: keyof LeaveRules, value: any) => void;
}

export interface DefaultMealPlanConfig {
  mealTypes: string[];
  pricingPeriods: Array<{ value: string; label: string }>;
  mealsPerDayOptions: number[];
  mealOptions: Array<{ value: string; label: string }>;
  maxLeaveMealsLimit: number;
  minNoticeHours: number;
  maxNoticeHours: number;
}

export interface GenerateMealPlansResponse {
  success: boolean;
  message: string;
  data: {
    totalGenerated: number;
    messesProcessed: number;
    results: Array<{
      messId: string;
      messName: string;
      generatedPlans: number;
      plans: any[];
    }>;
  };
}
