import React, { useState } from 'react';
import { Review } from '../Reviews.types';

interface ReviewListProps {
  reviews: Review[];
  onRespond: (id: string, message: string) => Promise<void>;
  onMarkHelpful: (id: string) => Promise<void>;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onRespond, onMarkHelpful }) => {
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const handleResponseChange = (id: string, text: string) => {
    setResponseText(prev => ({ ...prev, [id]: text }));
  };

  const handleSendResponse = async (id: string) => {
    if (responseText[id]?.trim()) {
      setLoadingActions(prev => ({ ...prev, [`respond-${id}`]: true }));
      try {
        await onRespond(id, responseText[id].trim());
        setResponseText(prev => ({ ...prev, [id]: '' }));
      } finally {
        setLoadingActions(prev => ({ ...prev, [`respond-${id}`]: false }));
      }
    }
  };

  const handleMarkHelpful = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`helpful-${id}`]: true }));
    try {
      await onMarkHelpful(id);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`helpful-${id}`]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">No reviews found.</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div 
            key={review.id} 
            className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-6 border border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300"
          >
            {/* Review Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-SmartMess-light-text dark:text-SmartMess-dark-text">
                    {review.title}
                  </h3>
                  {review.isVerified && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-SmartMess-light-success/20 text-SmartMess-light-success">
                      Verified
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-SmartMess-light-secondary dark:bg-SmartMess-dark-secondary text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                    {review.reviewType === 'mess' ? 'Mess Review' : 'Plan Review'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                  <span>By {review.userName}</span>
                  <span>•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  {review.planName && (
                    <>
                      <span>•</span>
                      <span>{review.planName}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-SmartMess-light-text dark:text-SmartMess-dark-text">
                  {review.rating}/5
                </span>
              </div>
            </div>

            {/* Review Content */}
            <p className="text-SmartMess-light-text dark:text-SmartMess-dark-text mb-4">
              {review.comment}
            </p>

            {/* Pros and Cons */}
            {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {review.pros && review.pros.length > 0 && (
                  <div>
                    <h4 className="font-medium text-SmartMess-light-success mb-2">👍 Pros</h4>
                    <ul className="space-y-1">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                          • {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.cons && review.cons.length > 0 && (
                  <div>
                    <h4 className="font-medium text-SmartMess-light-error mb-2">👎 Cons</h4>
                    <ul className="space-y-1">
                      {review.cons.map((con, index) => (
                        <li key={index} className="text-sm text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                          • {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* Recommendation */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                Would recommend:
              </span>
              <span className={`text-sm font-medium ${
                review.wouldRecommend 
                  ? 'text-SmartMess-light-success' 
                  : 'text-SmartMess-light-error'
              }`}>
                {review.wouldRecommend ? '✓ Yes' : '✗ No'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-SmartMess-light-border dark:border-SmartMess-dark-border">
              <button
                onClick={() => handleMarkHelpful(review.id)}
                disabled={loadingActions[`helpful-${review.id}`]}
                className="flex items-center space-x-2 text-sm text-SmartMess-light-text-secondary hover:text-SmartMess-primary transition-colors"
              >
                <span>👍</span>
                <span>
                  {loadingActions[`helpful-${review.id}`] ? 'Marking...' : 'Helpful'} ({review.helpfulCount})
                </span>
              </button>

              {/* Mess Owner Response Section */}
              {review.response ? (
                <div className="bg-SmartMess-light-secondary/50 dark:bg-SmartMess-dark-secondary/50 rounded-md p-3 mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-SmartMess-light-text dark:text-SmartMess-dark-text">
                      {review.response.messOwnerName}
                    </span>
                    <span className="px-2 py-1 text-xs bg-SmartMess-primary text-SmartMess-primary-foreground rounded-full">
                      Owner
                    </span>
                  </div>
                  <p className="text-sm text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary">
                    {review.response.message}
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={responseText[review.id] || ''}
                    onChange={(e) => handleResponseChange(review.id, e.target.value)}
                    placeholder="Respond to this review..."
                    className="px-3 py-1 text-sm border border-SmartMess-light-border rounded-md focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text"
                  />
                  <button
                    onClick={() => handleSendResponse(review.id)}
                    disabled={loadingActions[`respond-${review.id}`] || !responseText[review.id]?.trim()}
                    className="px-3 py-1 text-sm font-medium text-SmartMess-primary-foreground bg-SmartMess-primary rounded-md hover:bg-SmartMess-primary-light disabled:opacity-50 transition-all duration-200"
                  >
                    {loadingActions[`respond-${review.id}`] ? 'Sending...' : 'Respond'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;
