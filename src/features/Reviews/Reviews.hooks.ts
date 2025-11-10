import { useState } from 'react';
import { Review, ReviewFilterOptions, ReviewStatistics, MessPlan, ReviewFormData } from './Reviews.types';

// Mock service - replace with actual API calls
const ReviewService = {
  async getReviews(_filters: ReviewFilterOptions = {}): Promise<{ reviews: Review[] }> {
    // Mock data
    return {
      reviews: [
        {
          id: '1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          messId: 'mess-123',
          messName: 'Green Valley Mess',
          reviewType: 'mess' as const,
          rating: 4,
          title: 'Great food quality and service',
          comment: 'I have been eating here for 3 months and the food quality is consistently good. The staff is friendly and the dining area is clean.',
          pros: ['Good food quality', 'Clean environment', 'Friendly staff'],
          cons: ['Limited variety on weekends'],
          wouldRecommend: true,
          isVerified: true,
          helpfulCount: 12,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          images: []
        }
      ]
    };
  },

  async getReviewStats(): Promise<ReviewStatistics> {
    return {
      totalReviews: 156,
      averageRating: 4.2,
      ratingDistribution: [
        { rating: 5, count: 45, percentage: 28.8 },
        { rating: 4, count: 62, percentage: 39.7 },
        { rating: 3, count: 31, percentage: 19.9 },
        { rating: 2, count: 12, percentage: 7.7 },
        { rating: 1, count: 6, percentage: 3.8 }
      ],
      verifiedReviews: 134,
      recommendationRate: 85.2,
      responseRate: 67.3,
      reviewTypeDistribution: [
        { type: 'mess', count: 98 },
        { type: 'plan', count: 58 }
      ]
    };
  },

  async getMessPlans(): Promise<MessPlan[]> {
    return [
      {
        id: 'plan-1',
        name: 'Basic Monthly Plan',
        description: 'Lunch and Dinner for 30 days',
        price: 3500,
        duration: '30 days',
        features: ['Lunch', 'Dinner', 'Basic menu']
      },
      {
        id: 'plan-2',
        name: 'Premium Monthly Plan',
        description: 'All meals with premium options for 30 days',
        price: 5500,
        duration: '30 days',
        features: ['Breakfast', 'Lunch', 'Dinner', 'Premium menu', 'Special dishes']
      }
    ];
  },

  async createReview(data: ReviewFormData): Promise<Review> {
    // Mock implementation
    return {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Current User',
      userEmail: 'user@example.com',
      messId: data.messId,
      messName: 'Green Valley Mess',
      ...(data.planId ? { planId: data.planId, planName: 'Selected Plan' } : {}),
      reviewType: data.reviewType,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      pros: data.pros,
      cons: data.cons,
      wouldRecommend: data.wouldRecommend,
      isVerified: false,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: []
    };
  },

  async respondToReview(reviewId: string, message: string): Promise<void> {
    // Mock implementation
    console.log('Responding to review:', reviewId, message);
  },

  async markHelpful(reviewId: string): Promise<void> {
    // Mock implementation
    console.log('Marking review as helpful:', reviewId);
  }
};

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [messPlans, setMessPlans] = useState<MessPlan[]>([]);

  const fetchReviews = async (filters: ReviewFilterOptions = {}) => {
    try {
      setLoading(true);
      const result = await ReviewService.getReviews(filters);
      setReviews(result.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const reviewStats = await ReviewService.getReviewStats();
      setStats(reviewStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    }
  };

  const fetchMessPlans = async () => {
    try {
      const plans = await ReviewService.getMessPlans();
      setMessPlans(plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mess plans');
    }
  };

  const createReview = async (data: ReviewFormData) => {
    try {
      setLoading(true);
      const result = await ReviewService.createReview(data);
      setReviews(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const respondToReview = async (reviewId: string, message: string) => {
    try {
      await ReviewService.respondToReview(reviewId, message);
      // Update the review with the response
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                response: {
                  id: Date.now().toString(),
                  messOwnerId: 'current-mess-owner',
                  messOwnerName: 'Mess Owner',
                  message,
                  createdAt: new Date()
                }
              } 
            : review
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to review');
      throw err;
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      await ReviewService.markHelpful(reviewId);
      // Update the helpful count
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulCount: review.helpfulCount + 1 } 
            : review
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark review as helpful');
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    stats,
    messPlans,
    fetchReviews,
    fetchStats,
    fetchMessPlans,
    createReview,
    respondToReview,
    markHelpful
  };
};
