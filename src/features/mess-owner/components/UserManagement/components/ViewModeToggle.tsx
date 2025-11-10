import React from 'react';
import type { ViewModeToggleProps } from '../UserManagement.types';

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  isMobile
}) => {
  // Only show on large devices (lg and above)
  if (isMobile || window.innerWidth < 1024) return null;

  return (
    <div className="fixed top-20 lg:top-26 right-4 lg:right-24 z-30">
      <div className="flex bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border p-1 shadow-lg backdrop-blur-sm">
        <button
          onClick={() => onViewModeChange('cards')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'cards'
              ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-sm'
              : 'text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text'
          }`}
        >
          Cards
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'table'
              ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white shadow-sm'
              : 'text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text'
          }`}
        >
          Table
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle; 