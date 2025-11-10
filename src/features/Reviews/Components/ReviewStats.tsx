import React from 'react';
import { ReviewStatistics } from '../Reviews.types';

interface ReviewStatsProps {
  stats: ReviewStatistics | null;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-6 border border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
        <div className="flex justify-center items-center h-32">
          <p className="text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-4 border-l-4 border-SmartMess-primary hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">Total Reviews</h3>
            <p className="text-2xl font-bold text-SmartMess-light-text dark:text-SmartMess-dark-text mt-1">{stats.totalReviews}</p>
          </div>
          <div className="text-SmartMess-primary text-2xl">⭐</div>
        </div>
      </div>
      
      <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-4 border-l-4 border-SmartMess-light-success hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">Average Rating</h3>
            <p className="text-2xl font-bold text-SmartMess-light-text dark:text-SmartMess-dark-text mt-1">{stats.averageRating.toFixed(1)}</p>
          </div>
          <div className="text-SmartMess-light-success text-2xl">📊</div>
        </div>
      </div>
      
      <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-4 border-l-4 border-SmartMess-light-info hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">Verified Reviews</h3>
            <p className="text-2xl font-bold text-SmartMess-light-text dark:text-SmartMess-dark-text mt-1">{stats.verifiedReviews}</p>
          </div>
          <div className="text-SmartMess-light-info text-2xl">✓</div>
        </div>
        <div className="mt-2 text-xs text-SmartMess-light-text-muted dark:text-SmartMess-dark-text-muted">
          {Math.round((stats.verifiedReviews / stats.totalReviews) * 100)}% verified
        </div>
      </div>
      
      <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-4 border-l-4 border-SmartMess-light-warning hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">Recommendation Rate</h3>
            <p className="text-2xl font-bold text-SmartMess-light-text dark:text-SmartMess-dark-text mt-1">{stats.recommendationRate.toFixed(1)}%</p>
          </div>
          <div className="text-SmartMess-light-warning text-2xl">👍</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
