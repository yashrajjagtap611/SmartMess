import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreVertical } from 'lucide-react';
import type { UserTableRowProps } from '../UserManagement.types';
import { 
  getPlanBadgeColor, 
  getPaymentStatusColor, 
  getStatusIndicatorColor, 
  getStatusBadgeBackground 
} from '../UserManagement.utils';

const UserTableRow: React.FC<UserTableRowProps> = ({ 
  user, 
 
  isScrolling = false, 
  selectedLetter = null,
  onUserClick
}) => {
  const isHighlighted = selectedLetter === user.name.charAt(0).toUpperCase() && isScrolling;
  
  const handleRowClick = () => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <div
      id={`table-user-${user.id}`}
      onClick={handleRowClick}
      className={`bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-all duration-300 cursor-pointer group ${
        isHighlighted ? 'ring-2 ring-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:ring-SmartMess-light-primary dark:SmartMess-dark-primary/50 bg-SmartMess-light-primary dark:SmartMess-dark-primary/5 dark:bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 border-l-4 border-l-SmartMess-light-primary dark:SmartMess-dark-primary dark:border-l-SmartMess-light-primary dark:SmartMess-dark-primary' : ''
      }`}
      style={{
        transform: isHighlighted ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isHighlighted 
          ? '0 4px 12px rgba(26, 95, 99, 0.15)' 
          : '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: isHighlighted ? 'all 0.3s ease-in-out' : 'all 0.3s ease',
        zIndex: isHighlighted ? 10 : 1
      }}
    >
      <div className="flex items-center px-4 py-3">
        {/* User - flex-1 to take remaining space */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-SmartMess-light-primary dark:SmartMess-dark-primary/20 to-SmartMess-light-primary dark:SmartMess-dark-primary/40 dark:from-SmartMess-light-primary dark:SmartMess-dark-primary/30 dark:to-SmartMess-light-primary dark:SmartMess-dark-primary/50 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text truncate text-xs md:text-sm ${
              isHighlighted ? 'text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary font-bold' : ''
            }`}>
              {user.name}
            </h3>
            <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        {/* Plan */}
        <div className="w-24 lg:w-40 flex-shrink-0 text-center">
          <Badge className={`text-xs px-2 py-1 rounded-full ${getPlanBadgeColor(user.plan)}`}>
            {user.plan}
            {user.totalPlans && user.totalPlans > 1 && (
              <span className="ml-1 text-xs opacity-75">({user.totalPlans})</span>
            )}
          </Badge>
        </div>
        
        {/* Meals Left */}
        <div className="w-20 lg:w-30 flex-shrink-0 text-center">
          <span className="text-sm font-semibold text-SmartMess-light-text dark:SmartMess-dark-text-secondary dark:text-SmartMess-light-text dark:SmartMess-dark-text-secondary">
            {user.meals}
          </span>
        </div>
        
        {/* Payment Status */}
        <div className="w-24 lg:w-40 flex-shrink-0 text-center">
          <div className={`px-3 py-1 rounded-full flex items-center justify-center space-x-1 border ${getStatusBadgeBackground(user.paymentStatus)}`}>
            <div className={`w-2 h-2 rounded-full ${getStatusIndicatorColor(user.paymentStatus)}`} />
            <span className={`text-xs font-bold ${getPaymentStatusColor(user.paymentStatus)}`}>
              {user.paymentStatus}
            </span>
          </div>
        </div>
        
        {/* Amount Due */}
        <div className="w-20 lg:w-30 flex-shrink-0 text-right">
          {user.paymentAmount ? (
            <span className="text-sm font-bold text-SmartMess-light-error dark:text-SmartMess-dark-error">
              ${user.paymentAmount}
            </span>
          ) : (
            <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-right">-</span>
          )}
        </div>
        
        {/* Actions */}
        <div className="w-12 lg:w-20 flex-shrink-0 text-center">
          <button className="p-1 rounded-full hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors">
            <MoreVertical className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTableRow; 