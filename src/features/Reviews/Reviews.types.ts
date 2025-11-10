export interface Review {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  messId: string;
  messName: string;
  planId?: string;
  planName?: string;
  reviewType: 'mess' | 'plan';
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
  response?: {
    id: string;
    messOwnerId: string;
    messOwnerName: string;
    message: string;
    createdAt: Date;
  };
}

export interface ReviewFormData {
  messId: string;
  planId?: string;
  reviewType: 'mess' | 'plan';
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
}

export interface ReviewFilterOptions {
  reviewType?: 'mess' | 'plan' | 'all';
  rating?: number | 'all';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  search?: string;
  messId?: string;
  planId?: string;
  isVerified?: boolean;
  hasResponse?: boolean;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  verifiedReviews: number;
  recommendationRate: number;
  responseRate: number;
  reviewTypeDistribution: Array<{ type: 'mess' | 'plan'; count: number }>;
}

export interface MessPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
}
