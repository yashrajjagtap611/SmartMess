export interface MessMembership {
  messId: string;
  messName: string;
  messLocation: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  joinDate: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  mealPlans: {
    id: string;
    name: string;
    description: string;
    pricing: {
      amount: number;
      period: string;
    };
    mealType: string;
    mealsPerDay: number;
    status: 'active' | 'pending' | 'inactive';
    paymentStatus: 'pending' | 'paid' | 'overdue';
    paymentRequestStatus: 'none' | 'sent' | 'approved' | 'rejected';
    subscriptionDate: string;
    membershipId?: string;
  }[];
  paymentStatus: 'pending' | 'paid' | 'overdue';
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  canLeave: boolean;
  totalPlans?: number;
  totalMonthlyAmount?: number;
  upiId?: string;
}

export interface UserMessDetails {
  messes: MessMembership[];
  totalMesses: number;
  totalMealPlanSubscriptions: number;
  maxMesses: number;
  maxMealPlanSubscriptions: number;
  canJoinMore: boolean;
}

export interface DashboardStats {
  totalBills: number;
  pendingBills: number;
  paidBills: number;
  totalAmount: number;
  totalMesses: number;
  totalMealPlanSubscriptions: number;
  maxMesses: number;
  maxMealPlanSubscriptions: number;
  canJoinMore: boolean;
  messName?: string;
  memberSince?: string;
  currentPlan?: string;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'meal' | 'notification' | 'leave';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'info';
}

export interface AvailableMess {
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
  mealPlans?: any[];
  paymentMethods?: {
    upi?: string;
    bankAccount?: string;
    cash?: boolean;
  };
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

export interface ActivityItemProps {
  activity: RecentActivity;
}

export interface MessCardProps {
  mess: AvailableMess;
}

export interface PlanSubscription {
  messId: string;
  mealPlanId: string;
  paymentType: 'pay_now' | 'pay_later';
}

export interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mess: MessMembership;
  availablePlans: any[];
  onPlanSubscribed: (planId: string) => void;
}

export interface UserDashboardProps {
  className?: string;
}

