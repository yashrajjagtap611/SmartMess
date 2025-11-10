import { ENDPOINTS } from '@/constants/api';
import { MealFeedback } from '@/types/feedback';

const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || '/api';

interface FeedbackResponse {
  success: boolean;
  data: any;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Array<{ _id: number; count: number }>;
  sentimentStats: Array<{ _id: string; count: number }>;
  unresolvedCount: number;
}

export class FeedbackService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async getFeedback(params: {
    dateRange?: 'today' | 'week' | 'month';
    rating?: number | 'all';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ feedback: MealFeedback[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.dateRange) queryParams.append('dateRange', params.dateRange);
      if (params.rating && params.rating !== 'all') queryParams.append('rating', params.rating.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FEEDBACK.LIST}?${queryParams.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: FeedbackResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch feedback');
      }

      // Transform the data to match our frontend types
      const transformedFeedback: MealFeedback[] = result.data.map((item: any) => ({
        id: item._id || item.id,
        userId: item.userId,
        userName: item.userName,
        rating: item.rating,
        comment: item.comment,
        createdAt: new Date(item.createdAt),
        // Add additional fields if they exist
        ...(item.sentiment && { sentiment: item.sentiment }),
        ...(item.responses && { responses: item.responses }),
        ...(item.isResolved !== undefined && { isResolved: item.isResolved })
      }));

      return {
        feedback: transformedFeedback,
        pagination: result.pagination || {
          page: 1,
          limit: 20,
          total: transformedFeedback.length,
          pages: 1
        }
      };
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }

  static async getFeedbackStats(dateRange: 'today' | 'week' | 'month' = 'week'): Promise<FeedbackStats> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FEEDBACK.STATS}?dateRange=${dateRange}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FeedbackResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch feedback stats');
    }

    return result.data;
  }

  static async respondToFeedback(feedbackId: string, message: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FEEDBACK.RESPOND.replace(':feedbackId', feedbackId)}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FeedbackResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to send response');
    }

    return result.data;
  }

  static async resolveFeedback(feedbackId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FEEDBACK.RESOLVE.replace(':feedbackId', feedbackId)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FeedbackResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to resolve feedback');
    }
  }

  static async createFeedback(data: {
    messId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    mealDate: Date;
    rating: number;
    comment: string;
  }): Promise<MealFeedback> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FEEDBACK.CREATE}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        mealDate: data.mealDate.toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FeedbackResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create feedback');
    }

    // Transform the response to match our frontend types
    const item = result.data;
    return {
      id: item._id || item.id,
      userId: item.userId,
      userName: item.userName,
      rating: item.rating,
      comment: item.comment,
      createdAt: new Date(item.createdAt),
      ...(item.sentiment && { sentiment: item.sentiment }),
      ...(item.responses && { responses: item.responses }),
      ...(item.isResolved !== undefined && { isResolved: item.isResolved }),
      ...(item.messId && { messId: item.messId }),
      ...(item.mealType && { mealType: item.mealType }),
      ...(item.mealDate && { mealDate: new Date(item.mealDate) })
    };
  }
} 