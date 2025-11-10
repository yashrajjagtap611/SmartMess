// Credit Management Types

export interface CreditSlab {
  _id: string;
  minUsers: number;
  maxUsers: number;
  creditsPerUser: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreateCreditSlabRequest {
  minUsers: number;
  maxUsers: number;
  creditsPerUser: number;
}

export interface UpdateCreditSlabRequest {
  minUsers?: number;
  maxUsers?: number;
  creditsPerUser?: number;
  isActive?: boolean;
}

export interface CreditPurchasePlan {
  _id: string;
  name: string;
  description: string;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  price: number;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  validityDays?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreateCreditPurchasePlanRequest {
  name: string;
  description: string;
  baseCredits: number;
  bonusCredits?: number;
  price: number;
  currency?: 'INR' | 'USD' | 'EUR';
  isPopular?: boolean;
  features?: string[];
  validityDays?: number | undefined;
}

export interface UpdateCreditPurchasePlanRequest {
  name?: string;
  description?: string;
  baseCredits?: number;
  bonusCredits?: number;
  price?: number;
  isActive?: boolean;
  isPopular?: boolean;
  features?: string[];
  validityDays?: number | undefined;
}

export interface MessCredits {
  _id: string;
  messId: string;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  lastBillingDate?: string;
  nextBillingDate?: string;
  isTrialActive: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  trialCreditsUsed: number;
  monthlyUserCount: number;
  lastUserCountUpdate: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  _id: string;
  messId: {
    _id: string;
    name: string;
  };
  type: 'purchase' | 'deduction' | 'bonus' | 'refund' | 'adjustment' | 'trial';
  amount: number;
  description: string;
  referenceId?: string;
  planId?: {
    _id: string;
    name: string;
    baseCredits: number;
    bonusCredits: number;
    price: number;
  };
  billingPeriod?: {
    startDate: string;
    endDate: string;
  };
  userCount?: number;
  creditsPerUser?: number;
  metadata?: Record<string, any>;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface FreeTrialSettings {
  _id: string;
  isGloballyEnabled: boolean;
  defaultTrialDurationDays: number;
  trialCredits: number;
  allowedFeatures: string[];
  restrictedFeatures: string[];
  maxTrialsPerMess: number;
  cooldownPeriodDays: number;
  autoActivateOnRegistration: boolean;
  requiresApproval: boolean;
  notificationSettings: {
    sendWelcomeEmail: boolean;
    sendReminderEmails: boolean;
    reminderDays: number[];
    sendExpiryNotification: boolean;
  };
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface UpdateFreeTrialSettingsRequest {
  isGloballyEnabled?: boolean;
  defaultTrialDurationDays?: number;
  trialCredits?: number;
  allowedFeatures?: string[];
  restrictedFeatures?: string[];
  maxTrialsPerMess?: number;
  cooldownPeriodDays?: number;
  autoActivateOnRegistration?: boolean;
  requiresApproval?: boolean;
  notificationSettings?: {
    sendWelcomeEmail?: boolean;
    sendReminderEmails?: boolean;
    reminderDays?: number[];
    sendExpiryNotification?: boolean;
  };
}

export interface MonthlyBillingCalculation {
  userCount: number;
  creditsPerUser: number;
  totalCredits: number;
  currentBalance: number;
  canAfford: boolean;
}

export interface MonthlyBillingResult {
  messId: string;
  status: 'success' | 'suspended' | 'error';
  creditsDeducted?: number;
  userCount?: number;
  reason?: string;
  requiredCredits?: number;
  availableCredits?: number;
  error?: string;
}

export interface MessCreditsDetails {
  credits: MessCredits;
  recentTransactions: CreditTransaction[];
  nextBilling: MonthlyBillingCalculation;
}

export interface PurchaseCreditsRequest {
  planId: string;
  paymentReference?: string;
}

export interface AdjustCreditsRequest {
  amount: number;
  description: string;
}

export interface CreditAnalytics {
  _id: string;
  totalAmount: number;
  count: number;
  avgAmount: number;
}

export interface CreditTransactionsResponse {
  transactions: CreditTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter interfaces
export interface CreditSlabFilters {
  isActive?: boolean;
}

export interface CreditPurchasePlanFilters {
  isActive?: boolean;
  isPopular?: boolean;
}

export interface CreditTransactionFilters {
  messId?: string | undefined;
  type?: CreditTransaction['type'] | undefined;
  status?: CreditTransaction['status'] | undefined;
  page?: number;
  limit?: number;
}

export interface CreditAnalyticsFilters {
  startDate?: string | undefined;
  endDate?: string | undefined;
  messId?: string | undefined;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form interfaces for components
export interface CreditSlabFormData {
  minUsers: number;
  maxUsers: number;
  creditsPerUser: number;
}

export interface CreditPurchasePlanFormData {
  name: string;
  description: string;
  baseCredits: number;
  bonusCredits: number;
  price: number;
  currency: 'INR' | 'USD' | 'EUR';
  isPopular: boolean;
  features: string[];
  validityDays?: number | undefined;
}

export interface FreeTrialSettingsFormData {
  isGloballyEnabled: boolean;
  defaultTrialDurationDays: number;
  trialCredits: number;
  allowedFeatures: string[];
  restrictedFeatures: string[];
  maxTrialsPerMess: number;
  cooldownPeriodDays: number;
  autoActivateOnRegistration: boolean;
  requiresApproval: boolean;
  notificationSettings: {
    sendWelcomeEmail: boolean;
    sendReminderEmails: boolean;
    reminderDays: number[];
    sendExpiryNotification: boolean;
  };
}

// Component props interfaces
export interface CreditSlabCardProps {
  slab: CreditSlab;
  onEdit: (slab: CreditSlab) => void;
  onDelete: (slabId: string) => void;
  onToggleStatus: (slabId: string, isActive: boolean) => void;
}

export interface CreditPurchasePlanCardProps {
  plan: CreditPurchasePlan;
  onEdit: (plan: CreditPurchasePlan) => void;
  onDelete: (planId: string) => void;
  onToggleStatus: (planId: string, isActive: boolean) => void;
  onTogglePopular: (planId: string, isPopular: boolean) => void;
}

export interface CreditTransactionTableProps {
  transactions: CreditTransaction[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface MonthlyBillingDashboardProps {
  onProcessBilling: () => void;
  billingResults?: MonthlyBillingResult[];
  loading?: boolean;
}
