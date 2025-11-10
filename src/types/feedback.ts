export interface MealFeedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  responses?: Array<{
    id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: Date;
  }>;
  isResolved?: boolean;
}
