import React, { useState, useEffect } from 'react';
import { useReviews } from './Reviews.hooks';
import ReviewForm from './Components/ReviewForm';
import ReviewList from './Components/ReviewList';
import ReviewStats from './Components/ReviewStats';
import ReviewFilters from './Components/ReviewFilters';
import { ReviewFilterOptions } from './Reviews.types';

const Reviews: React.FC = () => {
  const {
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
  } = useReviews();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedReviewType, setSelectedReviewType] = useState<'mess' | 'plan'>('mess');
  // This would come from context in a real app
  const messId = 'mess-123';

  useEffect(() => {
    fetchReviews();
    fetchStats();
    fetchMessPlans();
  }, []);

  const handleFilterChange = (filters: ReviewFilterOptions) => {
    fetchReviews(filters);
  };

  const handleCreateReview = async (data: any) => {
    await createReview(data);
    fetchReviews();
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:bg-SmartMess-dark-bg transition-all duration-300">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-surface/80 dark:bg-SmartMess-dark-surface/80 border-b border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
        <div className="flex items-center justify-center w-full lg:hidden">
          <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:text-SmartMess-dark-text">
            Reviews & Ratings
          </h1>
        </div>
        <div className="hidden lg:flex items-center justify-between w-full">
          <div className="flex items-center space-x-6 px-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-SmartMess-light-text dark:text-SmartMess-dark-text">
                Reviews & Ratings
              </h1>
              <p className="text-sm text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                Share your experience and help others make informed decisions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pr-6">
            <div className="flex bg-SmartMess-light-secondary dark:bg-SmartMess-dark-secondary rounded-lg p-1">
              <button
                onClick={() => setSelectedReviewType('mess')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedReviewType === 'mess'
                    ? 'bg-SmartMess-primary text-SmartMess-primary-foreground'
                    : 'text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary'
                }`}
              >
                Mess Review
              </button>
              <button
                onClick={() => setSelectedReviewType('plan')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedReviewType === 'plan'
                    ? 'bg-SmartMess-primary text-SmartMess-primary-foreground'
                    : 'text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary'
                }`}
              >
                Plan Review
              </button>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-SmartMess-primary-foreground bg-SmartMess-primary rounded-md hover:bg-SmartMess-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary transition-all duration-200"
            >
              Write Review
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header Actions */}
      <div className="lg:hidden p-4 bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface border-b border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-SmartMess-light-text dark:text-SmartMess-dark-text">
            Reviews & Ratings
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-sm font-medium text-SmartMess-primary-foreground bg-SmartMess-primary rounded-md hover:bg-SmartMess-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary transition-all duration-200"
          >
            Write Review
          </button>
        </div>
        <div className="flex bg-SmartMess-light-secondary dark:bg-SmartMess-dark-secondary rounded-lg p-1">
          <button
            onClick={() => setSelectedReviewType('mess')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedReviewType === 'mess'
                ? 'bg-SmartMess-primary text-SmartMess-primary-foreground'
                : 'text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary'
            }`}
          >
            Mess Review
          </button>
          <button
            onClick={() => setSelectedReviewType('plan')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedReviewType === 'plan'
                ? 'bg-SmartMess-primary text-SmartMess-primary-foreground'
                : 'text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary'
            }`}
          >
            Plan Review
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showForm ? (
          <ReviewForm 
            onSubmit={handleCreateReview}
            onCancel={() => setShowForm(false)}
            messId={messId}
            reviewType={selectedReviewType}
            messPlans={messPlans}
          />
        ) : (
          <>
            <ReviewStats stats={stats} />
            
            <ReviewFilters 
              onFilterChange={handleFilterChange}
              selectedReviewType={selectedReviewType}
            />
            
            {error && (
              <div className="bg-SmartMess-light-error/10 dark:bg-SmartMess-dark-error/20 border border-SmartMess-light-error/30 dark:border-SmartMess-dark-error/50 rounded-md p-4 mb-6">
                <p className="text-SmartMess-light-error dark:text-SmartMess-dark-error">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-SmartMess-primary"></div>
                  <p className="text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">Loading reviews...</p>
                </div>
              </div>
            ) : (
              <ReviewList 
                reviews={reviews}
                onRespond={async (id: string, message: string) => {
                  await respondToReview(id, message);
                }}
                onMarkHelpful={async (id: string) => {
                  await markHelpful(id);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Reviews;
