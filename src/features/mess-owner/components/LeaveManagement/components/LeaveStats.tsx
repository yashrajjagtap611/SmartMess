import React from 'react';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { LeaveRequestStats } from '../LeaveManagement.types';

interface LeaveStatsProps {
  stats: LeaveRequestStats;
}

const LeaveStats: React.FC<LeaveStatsProps> = ({ stats }) => {
  // Show only 4 key stats in 2x2 grid
  const statCards = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-4 border SmartMess-light-border dark:SmartMess-dark-border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaveStats;











