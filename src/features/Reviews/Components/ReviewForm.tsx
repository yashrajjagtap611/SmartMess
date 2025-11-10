import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ReviewFormData, MessPlan } from '../Reviews.types';

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  messId: string;
  reviewType: 'mess' | 'plan';
  messPlans: MessPlan[];
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  onSubmit, 
  onCancel, 
  messId, 
  reviewType, 
  messPlans 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    messId,
    reviewType,
    rating: 5,
    title: '',
    comment: '',
    pros: [''],
    cons: [''],
    wouldRecommend: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors['title'] = 'Review title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors['title'] = 'Title must be at least 5 characters long';
    }
    
    if (!formData.comment.trim()) {
      newErrors['comment'] = 'Review comment is required';
    } else if (formData.comment.trim().length < 20) {
      newErrors['comment'] = 'Comment must be at least 20 characters long';
    }
    
    if (formData.rating < 1 || formData.rating > 5) {
      newErrors['rating'] = 'Please select a rating between 1 and 5 stars';
    }

    if (reviewType === 'plan' && !formData.planId) {
      newErrors['planId'] = 'Please select a plan to review';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleArrayChange = (field: 'pros' | 'cons', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'pros' | 'cons') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'pros' | 'cons', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Filter out empty pros and cons
      const cleanedData = {
        ...formData,
        pros: formData.pros.filter(item => item.trim() !== ''),
        cons: formData.cons.filter(item => item.trim() !== '')
      };
      
      await onSubmit(cleanedData);
      toast({
        title: 'Success',
        description: 'Your review has been submitted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-6 border border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 text-SmartMess-light-text dark:text-SmartMess-dark-text">
        Write a {reviewType === 'mess' ? 'Mess' : 'Plan'} Review
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Selection for Plan Reviews */}
        {reviewType === 'plan' && (
          <div>
            <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
              Select Plan
            </label>
            <select
              name="planId"
              value={formData.planId || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200 ${
                errors['planId'] ? 'border-SmartMess-light-error' : 'border-SmartMess-light-border'
              }`}
              required
            >
              <option value="">Select a plan to review</option>
              {messPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ₹{plan.price}
                </option>
              ))}
            </select>
            {errors['planId'] && (
              <p className="mt-1 text-sm text-SmartMess-light-error dark:text-SmartMess-dark-error">{errors['planId']}</p>
            )}
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Overall Rating
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`text-3xl transition-colors ${
                  star <= formData.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-SmartMess-light-text-muted dark:text-SmartMess-dark-text-muted">
              {formData.rating} star{formData.rating !== 1 ? 's' : ''}
            </span>
          </div>
          {errors['rating'] && (
            <p className="mt-1 text-sm text-SmartMess-light-error dark:text-SmartMess-dark-error">{errors['rating']}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Review Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200 ${
              errors['title'] ? 'border-SmartMess-light-error' : 'border-SmartMess-light-border'
            }`}
            placeholder="Summarize your experience in a few words"
            required
          />
          {errors['title'] && (
            <p className="mt-1 text-sm text-SmartMess-light-error dark:text-SmartMess-dark-error">{errors['title']}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Detailed Review
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200 ${
              errors['comment'] ? 'border-SmartMess-light-error' : 'border-SmartMess-light-border'
            }`}
            placeholder="Share your detailed experience..."
            required
          />
          {errors['comment'] && (
            <p className="mt-1 text-sm text-SmartMess-light-error dark:text-SmartMess-dark-error">{errors['comment']}</p>
          )}
        </div>

        {/* Pros and Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div>
            <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-2">
              What did you like? (Pros)
            </label>
            {formData.pros.map((pro, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => handleArrayChange('pros', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
                  placeholder="Add a positive point"
                />
                {formData.pros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('pros', index)}
                    className="text-SmartMess-light-error hover:text-SmartMess-light-error/80"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('pros')}
              className="text-sm text-SmartMess-primary hover:text-SmartMess-primary-light"
            >
              + Add another pro
            </button>
          </div>

          {/* Cons */}
          <div>
            <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-2">
              What could be improved? (Cons)
            </label>
            {formData.cons.map((con, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={con}
                  onChange={(e) => handleArrayChange('cons', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
                  placeholder="Add an area for improvement"
                />
                {formData.cons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('cons', index)}
                    className="text-SmartMess-light-error hover:text-SmartMess-light-error/80"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('cons')}
              className="text-sm text-SmartMess-primary hover:text-SmartMess-primary-light"
            >
              + Add another con
            </button>
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="wouldRecommend"
              checked={formData.wouldRecommend}
              onChange={handleChange}
              className="rounded border-SmartMess-light-border text-SmartMess-primary focus:ring-SmartMess-primary"
            />
            <span className="text-sm text-SmartMess-light-text dark:text-SmartMess-dark-text">
              I would recommend this {reviewType} to others
            </span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-SmartMess-light-text-secondary bg-SmartMess-light-secondary rounded-md hover:bg-SmartMess-light-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary dark:bg-SmartMess-dark-secondary dark:text-SmartMess-dark-text dark:hover:bg-SmartMess-dark-hover transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-SmartMess-primary-foreground bg-SmartMess-primary rounded-md hover:bg-SmartMess-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-primary disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
