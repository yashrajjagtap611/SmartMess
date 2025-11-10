import React, { useState } from 'react';
import { ReviewFilterOptions } from '../Reviews.types';

interface ReviewFiltersProps {
  onFilterChange: (filters: ReviewFilterOptions) => void;
  selectedReviewType: 'mess' | 'plan';
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({ onFilterChange, selectedReviewType }) => {
  const [filters, setFilters] = useState<ReviewFilterOptions>({
    reviewType: selectedReviewType,
    dateRange: 'all',
    rating: 'all'
  });

  const handleFilterChange = (key: keyof ReviewFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-4 mb-6 border border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
      <div className="mb-4">
        <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
          Search Reviews
        </label>
        <input
          type="text"
          placeholder="Search by title, content, or reviewer name..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Date Range
          </label>
          <select
            value={filters.dateRange || 'all'}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Rating
          </label>
          <select
            value={filters.rating?.toString() || 'all'}
            onChange={(e) => handleFilterChange('rating', e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Verification Status
          </label>
          <select
            value={
              filters.isVerified === true ? 'verified' : 
              filters.isVerified === false ? 'unverified' : 'all'
            }
            onChange={(e) => {
              if (e.target.value === 'verified') {
                handleFilterChange('isVerified', true);
              } else if (e.target.value === 'unverified') {
                handleFilterChange('isVerified', false);
              } else {
                handleFilterChange('isVerified', undefined);
              }
            }}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          >
            <option value="all">All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Response Status
          </label>
          <select
            value={
              filters.hasResponse === true ? 'responded' : 
              filters.hasResponse === false ? 'no_response' : 'all'
            }
            onChange={(e) => {
              if (e.target.value === 'responded') {
                handleFilterChange('hasResponse', true);
              } else if (e.target.value === 'no_response') {
                handleFilterChange('hasResponse', false);
              } else {
                handleFilterChange('hasResponse', undefined);
              }
            }}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          >
            <option value="all">All Reviews</option>
            <option value="responded">With Response</option>
            <option value="no_response">No Response</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;
