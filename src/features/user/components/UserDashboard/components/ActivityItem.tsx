import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import {
  BellIcon
} from '@heroicons/react/24/outline';
import type { ActivityItemProps } from '../UserDashboard.types';

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getStatusIcon = () => {
    switch (activity.status) {
      case 'success':
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
        );
      case 'info':
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <InformationCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-900/20">
            <BellIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (activity.status) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10';
      case 'info':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg hover:shadow-md transition-all duration-200 border-l-4 ${getStatusColor()} group cursor-pointer`}>
      {getStatusIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {activity.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {activity.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ClockIcon className="w-3 h-3" />
              <span>{getTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {new Date(activity.timestamp).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
