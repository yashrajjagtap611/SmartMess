export interface MealPlan {
  id: string;
  name: string;
  description: string;
  pricing: {
    amount: number;
    period: 'day' | 'week' | '15days' | 'month' | '3months' | '6months' | 'year';
  };
  mealType: string;
  mealsPerDay: number;
  isActive: boolean;
  leaveRules: {
    maxLeaveDays: number;
    maxLeaveMeals: number;
    requireTwoHourNotice: boolean;
    noticeHours: number;
    minConsecutiveDays: number;
    extendSubscription: boolean;
    autoApproval: boolean;
    leaveLimitsEnabled: boolean;
    consecutiveLeaveEnabled: boolean;
    maxLeaveDaysEnabled: boolean;
    maxLeaveMealsEnabled: boolean;
  };
}

export interface MessDetails {
  id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  currentMembers: number;
  monthlyRate: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  colleges: string[];
  rating?: number;
  reviews?: number;
  image?: string;
  upiId?: string;
  mealPlans?: MealPlan[];
}

export interface MessDetailsModalProps {
  mess: MessDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinMess: (messId: string, mealPlanId: string, paymentType: 'pay_now' | 'pay_later') => void;
}

