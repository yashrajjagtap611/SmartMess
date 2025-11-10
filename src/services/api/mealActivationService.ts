import apiClient from '../api';

export interface MealActivation {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  status: 'generated' | 'activated' | 'expired';
  qrCode?: string;
  expiresAt: Date;
  activatedAt?: Date;
  meal: {
    id: string;
    name: string;
    type: string;
    description?: string;
    imageUrl?: string;
  };
  mess: {
    id: string;
    name: string;
  };
  scannedBy?: string;
}

export interface AvailableMeal {
  id: string;
  name: string;
  description?: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  category: string;
  categories?: string[];
  imageUrl?: string;
  messName: string;
  hasQRCode: boolean;
  canGenerate: boolean;
}

export interface QRCodeGenerationResult {
  qrCode: string;
  qrCodeData: string;
  activationId: string;
  expiresAt: Date;
}

export interface ActivationStats {
  summary: {
    totalGenerated: number;
    totalActivated: number;
    totalExpired: number;
    pending: number;
    activationRate: string;
  };
  mealTypeBreakdown: Array<{
    _id: {
      mealType: string;
      status: string;
    };
    count: number;
  }>;
}

class MealActivationService {
  /**
   * Generate QR code for meal activation
   */
  async generateQRCode(mealId: string, mealType: string, date?: string): Promise<QRCodeGenerationResult> {
    try {
      const response = await apiClient.post('/meal-activation/generate', {
        mealId,
        mealType,
        date
      });

      if (response.data.success) {
        return {
          ...response.data.data,
          expiresAt: new Date(response.data.data.expiresAt)
        };
      } else {
        throw new Error(response.data.message || 'Failed to generate QR code');
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to generate QR code');
    }
  }

  /**
   * Scan QR code (for mess owners)
   */
  async scanQRCode(qrCodeData: string): Promise<{
    activation: any;
    mealInfo: any;
  }> {
    try {
      const response = await apiClient.post('/meal-activation/scan', {
        qrCodeData
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to scan QR code');
      }
    } catch (error: any) {
      console.error('Error scanning QR code:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to scan QR code');
    }
  }

  /**
   * User self-scan for meal activation
   */
  async userScanQRCode(qrCodeData: string): Promise<{
    activation: any;
    mealInfo: any;
  }> {
    try {
      const response = await apiClient.post('/meal-activation/user-scan', {
        qrCodeData
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to activate meal');
      }
    } catch (error: any) {
      console.error('Error in user scan:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to activate meal');
    }
  }

  /**
   * Get user's meal activation history
   */
  async getMealHistory(limit: number = 50): Promise<MealActivation[]> {
    try {
      const response = await apiClient.get(`/meal-activation/history?limit=${limit}`);

      if (response.data.success) {
        return response.data.data.map((activation: any) => ({
          ...activation,
          expiresAt: new Date(activation.expiresAt),
          activatedAt: activation.activatedAt ? new Date(activation.activatedAt) : undefined
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch meal history');
      }
    } catch (error: any) {
      console.error('Error fetching meal history:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch meal history');
    }
  }

  /**
   * Get user's active meals for today
   */
  async getActiveMeals(date?: string): Promise<MealActivation[]> {
    try {
      const url = date ? `/meal-activation/active?date=${date}` : '/meal-activation/active';
      const response = await apiClient.get(url);

      if (response.data.success) {
        return response.data.data.map((activation: any) => ({
          ...activation,
          expiresAt: new Date(activation.expiresAt),
          activatedAt: activation.activatedAt ? new Date(activation.activatedAt) : undefined
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch active meals');
      }
    } catch (error: any) {
      console.error('Error fetching active meals:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch active meals');
    }
  }

  /**
   * Get meal activation statistics (for mess owners)
   */
  async getActivationStats(date?: string, mealType?: string): Promise<ActivationStats> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (mealType) params.append('mealType', mealType);
      
      const url = params.toString() ? `/meal-activation/stats?${params.toString()}` : '/meal-activation/stats';
      const response = await apiClient.get(url);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch activation statistics');
      }
    } catch (error: any) {
      console.error('Error fetching activation stats:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch activation statistics');
    }
  }

  /**
   * Get today's available meals for QR generation
   */
  async getTodaysMeals(date?: string): Promise<AvailableMeal[]> {
    try {
      const url = date ? `/meal-activation/today-meals?date=${date}` : '/meal-activation/today-meals';
      const response = await apiClient.get(url);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch today\'s meals');
      }
    } catch (error: any) {
      console.error('Error fetching today\'s meals:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch today\'s meals');
    }
  }

  /**
   * Check if it's the right time for a meal type
   */
  isValidMealTime(mealType: string): boolean {
    const now = new Date();
    const hour = now.getHours();

    switch (mealType) {
      case 'breakfast':
        return hour >= 6 && hour < 11;
      case 'lunch':
        return hour >= 11 && hour < 16;
      case 'dinner':
        return hour >= 16 && hour < 22;
      default:
        return false;
    }
  }

  /**
   * Get meal type icon
   */
  getMealTypeIcon(mealType: string): string {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      default:
        return '🍽️';
    }
  }

  /**
   * Format time remaining until expiration
   */
  formatTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }
}

export default new MealActivationService();
