import React, { useState } from 'react';
import { FeedbackFilterOptions } from '../FeedbackComplaints.types';

interface ComplaintFiltersProps {
  onFilterChange: (filters: FeedbackFilterOptions) => void;
}

const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FeedbackFilterOptions>({
    dateRange: 'week',
    rating: 'all',
    complaintType: 'all',
    priority: 'all'
  });

  const handleFilterChange = (key: keyof FeedbackFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-SmartMess-light-surface dark:bg-SmartMess-dark-surface rounded-lg shadow-md p-4 mb-6 border border-SmartMess-light-border dark:border-SmartMess-dark-border transition-all duration-300">
      <div className="mb-4">
        <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
          Search Complaints
        </label>
        <input
          type="text"
          placeholder="Search by description, user name, or complaint type..."
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
            value={filters.dateRange || 'week'}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          >
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
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Complaint Type
          </label>
          <select
            value={filters.complaintType || 'all'}
            onChange={(e) => handleFilterChange('complaintType', e.target.value)}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          >
            <option value="all">All Types</option>
            <option value="service">Service Issue</option>
            <option value="food_quality">Food Quality</option>
            <option value="hygiene">Hygiene</option>
            <option value="staff_behavior">Staff Behavior</option>
            <option value="billing">Billing</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-SmartMess-light-text-secondary dark:text-SmartMess-dark-text-secondary mb-1">
            Status
          </label>
          <select
            value={
              filters.isResolved === true ? 'resolved' : 
              filters.isResolved === false ? 'unresolved' : 'all'
            }
            onChange={(e) => {
              if (e.target.value === 'resolved') {
                handleFilterChange('isResolved', true);
              } else if (e.target.value === 'unresolved') {
                handleFilterChange('isResolved', false);
              } else {
                handleFilterChange('isResolved', undefined);
              }
            }}
            className="w-full px-3 py-2 border border-SmartMess-light-border rounded-md shadow-sm focus:outline-none focus:ring-SmartMess-primary focus:border-SmartMess-primary dark:bg-SmartMess-dark-input-bg dark:border-SmartMess-dark-border dark:text-SmartMess-dark-text transition-all duration-200"
          >
            <option value="all">All Statuses</option>
            <option value="resolved">Resolved</option>
            <option value="unresolved">Unresolved</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ComplaintFilters;