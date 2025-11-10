import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import {
  CreditSlab,
  CreditPurchasePlan,
  MessCredits,
  FreeTrialSettings,
  MessCreditsDetails,
  CreditAnalytics,
  CreditTransactionsResponse,
  CreateCreditSlabRequest,
  UpdateCreditSlabRequest,
  CreateCreditPurchasePlanRequest,
  UpdateCreditPurchasePlanRequest,
  UpdateFreeTrialSettingsRequest,
  PurchaseCreditsRequest,
  AdjustCreditsRequest,
  CreditSlabFilters,
  CreditPurchasePlanFilters,
  CreditTransactionFilters,
  CreditAnalyticsFilters,
  ApiResponse
} from '../types/creditManagement';

class CreditManagementService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Credit Slab Management
  async createCreditSlab(data: CreateCreditSlabRequest): Promise<ApiResponse<CreditSlab>> {
    return this.makeRequest(ENDPOINTS.CREDIT_MANAGEMENT.SLABS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCreditSlabs(filters?: CreditSlabFilters): Promise<ApiResponse<CreditSlab[]>> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }

    const endpoint = `${ENDPOINTS.CREDIT_MANAGEMENT.SLABS}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async updateCreditSlab(slabId: string, data: UpdateCreditSlabRequest): Promise<ApiResponse<CreditSlab>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.SLAB_BY_ID.replace(':slabId', slabId);
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCreditSlab(slabId: string): Promise<ApiResponse<CreditSlab>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.SLAB_BY_ID.replace(':slabId', slabId);
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  // Credit Purchase Plan Management
  async createCreditPurchasePlan(data: CreateCreditPurchasePlanRequest): Promise<ApiResponse<CreditPurchasePlan>> {
    return this.makeRequest(ENDPOINTS.CREDIT_MANAGEMENT.PLANS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCreditPurchasePlans(filters?: CreditPurchasePlanFilters): Promise<ApiResponse<CreditPurchasePlan[]>> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters?.isPopular !== undefined) {
      params.append('isPopular', filters.isPopular.toString());
    }

    const endpoint = `${ENDPOINTS.CREDIT_MANAGEMENT.PLANS}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async updateCreditPurchasePlan(planId: string, data: UpdateCreditPurchasePlanRequest): Promise<ApiResponse<CreditPurchasePlan>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.PLAN_BY_ID.replace(':planId', planId);
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCreditPurchasePlan(planId: string): Promise<ApiResponse<CreditPurchasePlan>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.PLAN_BY_ID.replace(':planId', planId);
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  // Mess Credits Management
  async getMessCredits(messId: string): Promise<ApiResponse<MessCreditsDetails>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.MESS_CREDITS.replace(':messId', messId);
    return this.makeRequest(endpoint);
  }

  async purchaseCredits(messId: string, data: PurchaseCreditsRequest): Promise<ApiResponse<MessCredits>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.PURCHASE_CREDITS.replace(':messId', messId);
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adjustCredits(messId: string, data: AdjustCreditsRequest): Promise<ApiResponse<MessCredits>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.ADJUST_CREDITS.replace(':messId', messId);
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Free Trial Management
  async getFreeTrialSettings(): Promise<ApiResponse<FreeTrialSettings>> {
    return this.makeRequest(ENDPOINTS.CREDIT_MANAGEMENT.TRIAL_SETTINGS);
  }

  async updateFreeTrialSettings(data: UpdateFreeTrialSettingsRequest): Promise<ApiResponse<FreeTrialSettings>> {
    return this.makeRequest(ENDPOINTS.CREDIT_MANAGEMENT.TRIAL_SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async activateFreeTrial(messId: string): Promise<ApiResponse<MessCredits>> {
    const endpoint = ENDPOINTS.CREDIT_MANAGEMENT.ACTIVATE_TRIAL.replace(':messId', messId);
    return this.makeRequest(endpoint, {
      method: 'POST',
    });
  }

  // Monthly Billing Automation removed

  // Reports and Analytics
  async getCreditTransactions(filters?: CreditTransactionFilters): Promise<ApiResponse<CreditTransactionsResponse>> {
    const params = new URLSearchParams();
    if (filters?.messId) params.append('messId', filters.messId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const endpoint = `${ENDPOINTS.CREDIT_MANAGEMENT.TRANSACTIONS}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getCreditAnalytics(filters?: CreditAnalyticsFilters): Promise<ApiResponse<CreditAnalytics[]>> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.messId) params.append('messId', filters.messId);

    const endpoint = `${ENDPOINTS.CREDIT_MANAGEMENT.ANALYTICS}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatCredits(credits: number): string {
    return new Intl.NumberFormat('en-IN').format(credits);
  }

  calculateCreditValue(credits: number, pricePerCredit: number = 1): number {
    return credits * pricePerCredit;
  }

  getTrialDaysRemaining(trialEndDate: string): number {
    const endDate = new Date(trialEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isTrialExpired(trialEndDate: string): boolean {
    return new Date(trialEndDate) < new Date();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'trial':
        return 'text-blue-600';
      case 'suspended':
        return 'text-red-600';
      case 'expired':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  getTransactionTypeColor(type: string): string {
    switch (type) {
      case 'purchase':
      case 'bonus':
      case 'trial':
        return 'text-green-600';
      case 'deduction':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      case 'adjustment':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }
}

export const creditManagementService = new CreditManagementService();
export default creditManagementService;
