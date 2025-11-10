import React from 'react';
import type { StatCardProps } from '../UserDashboard.types';

const StatsCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}) => {
  return (
    <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-soft hover:shadow-medium transition-all duration-300 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border group">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-xs sm:text-sm font-medium truncate">
            {title}
          </p>
          <p className="text-base sm:text-lg lg:text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mt-1 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl ${color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
