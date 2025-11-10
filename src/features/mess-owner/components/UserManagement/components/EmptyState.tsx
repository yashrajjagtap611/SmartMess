import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  onClearFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onClearFilters }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-sm mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-SmartMess-light-primary dark:SmartMess-dark-primary/5 to-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:from-SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:to-SmartMess-light-primary dark:SmartMess-dark-primary/30 rounded-full flex items-center justify-center">
          <Users className="w-10 h-10 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary opacity-70" />
        </div>
        <h3 className="text-lg font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
          No users found
        </h3>
        <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">
          No users found matching your criteria.
        </p>
        {searchQuery && (
          <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-3">
            Try adjusting your search terms or filters.
          </p>
        )}
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="mt-4 border-SmartMess-light-primary dark:SmartMess-dark-primary/30 dark:border-SmartMess-light-primary dark:SmartMess-dark-primary/30 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/20"
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
};

export default EmptyState; 