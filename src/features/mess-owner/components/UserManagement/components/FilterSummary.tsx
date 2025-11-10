import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { FilterSummaryProps } from '../UserManagement.types';
import { getFilterBadgeColor } from '../UserManagement.utils';

const FilterSummary: React.FC<FilterSummaryProps> = ({
  selectedFilter,
  onClearFilter,
  filterOptions
}) => {
  if (selectedFilter === 'all') return null;

  const selectedOption = filterOptions.find(opt => opt.id === selectedFilter);

  return (
    <div className="mb-4 p-3 bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-secondary dark:text-SmartMess-light-text dark:SmartMess-dark-text-secondary font-medium">
            Filtered by:
          </span>
          <Badge className={`text-xs px-2.5 py-1 font-medium ${getFilterBadgeColor(selectedFilter)}`}>
            {selectedOption?.title}
          </Badge>
        </div>
        <button
          onClick={onClearFilter}
          className="text-xs text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:text-SmartMess-light-primary dark:SmartMess-dark-primary-dark dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary-light font-medium hover:underline transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterSummary; 