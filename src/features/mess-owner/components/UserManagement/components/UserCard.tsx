import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, DollarSign, MoreVertical } from 'lucide-react';
import type { UserCardProps } from '../UserManagement.types';
import { 
  getPlanBadgeColor, 
  getPaymentStatusColor, 
  getStatusIndicatorColor, 
  getStatusBadgeBackground 
} from '../UserManagement.utils';

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  index, 
 
  isScrolling = false, 
  selectedLetter = null,
  onUserClick
}) => {
  const isHighlighted = selectedLetter === user.name.charAt(0).toUpperCase() && isScrolling;
  
  const handleCardClick = () => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <div
      id={`card-user-${user.id}`}
      onClick={handleCardClick}
      className={`
        rounded-xl border border-border p-4 bg-card transition-all
        hover:shadow-lg cursor-pointer 
        hover:border-primary/30
        group animate-slide-up h-full
        ${isHighlighted ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
      `}
      style={{
        animationDelay: `${index * 50}ms`,
        transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHighlighted 
          ? '0 8px 25px rgba(26, 95, 99, 0.15)' 
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: isHighlighted ? 'all 0.3s ease-in-out' : 'all 0.3s ease'
      }}
    >
      {/* Mobile Layout - Row Style */}
      <div className="flex items-start justify-between sm:hidden">
        {/* User Info Section */}
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          {/* Avatar */}
          <Avatar className="w-10 h-10 flex-shrink-0 border-2 SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border group-hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:group-hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 transition-colors shadow-md">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-SmartMess-light-primary dark:SmartMess-dark-primary/20 to-SmartMess-light-primary dark:SmartMess-dark-primary/40 dark:from-SmartMess-light-primary dark:SmartMess-dark-primary/30 dark:to-SmartMess-light-primary dark:SmartMess-dark-primary/50 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary font-bold text-xs">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {/* User Details */}
          <div className="flex-1 min-w-0 pt-1">
            {/* Name and Plan */}
            <div className="flex flex-col space-y-1 mb-2">
              <h3 className="font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text text-sm group-hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:group-hover:text-SmartMess-light-primary dark:SmartMess-dark-primary transition-colors">
                {user.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Mobile: Colored text */}
                <span className={`text-xs font-medium ${getPlanBadgeColor(user.plan).replace('bg-', 'text-').replace('border-', 'text-')}`}>
                  {user.plan}
                  {user.totalPlans && user.totalPlans > 1 && (
                    <span className="ml-1 text-xs opacity-75">({user.totalPlans} plans)</span>
                  )}
                </span>
                {!user.isActive && (
                  <Badge className="bg-SmartMess-light-error/10 text-SmartMess-light-error dark:bg-SmartMess-dark-error/20 dark:text-SmartMess-dark-error text-xs px-2.5 py-1 rounded-full font-medium">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Email */}
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-3 h-3 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted flex-shrink-0" />
              <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        
        {/* Status Section */}
        <div className="flex flex-col items-end space-y-2 ml-2">
          {/* Payment Status */}
          <div className={`px-2 py-1.5 rounded-full flex items-center space-x-1 border ${getStatusBadgeBackground(user.paymentStatus)} shadow-sm`}>
            <div className={`w-2 h-2 rounded-full ${getStatusIndicatorColor(user.paymentStatus)} shadow-sm`} />
            <span className={`text-xs font-bold ${getPaymentStatusColor(user.paymentStatus)}`}>
              {user.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Card Style */}
      <div className="hidden sm:flex flex-col h-full">
        {/* Header Section with Avatar and Actions */}
        <div className="flex items-start justify-between mb-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 flex-shrink-0 border-2 SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border group-hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:group-hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 transition-colors shadow-md">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-SmartMess-light-primary dark:SmartMess-dark-primary/20 to-SmartMess-light-primary dark:SmartMess-dark-primary/40 dark:from-SmartMess-light-primary dark:SmartMess-dark-primary/30 dark:to-SmartMess-light-primary dark:SmartMess-dark-primary/50 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary font-bold text-lg md:text-xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {/* Actions Menu */}
          <button className="p-2 rounded-full hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors group-hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:group-hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/20">
            <MoreVertical className="w-5 h-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted group-hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:group-hover:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
          </button>
        </div>

        {/* User Details Section */}
        <div className="space-y-3 flex-1">
          {/* Name and Plan */}
          <div className="space-y-2">
            <h3 className="font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text text-lg md:text-xl group-hover:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:group-hover:text-SmartMess-light-primary dark:SmartMess-dark-primary transition-colors line-clamp-2">
              {user.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={`text-sm px-3 py-1.5 rounded-full ${getPlanBadgeColor(user.plan)}`}>
                {user.plan}
                {user.totalPlans && user.totalPlans > 1 && (
                  <span className="ml-1 text-xs opacity-75">({user.totalPlans} plans)</span>
                )}
              </Badge>
              {!user.isActive && (
                <Badge className="bg-SmartMess-light-error/10 text-SmartMess-light-error dark:bg-SmartMess-dark-error/20 dark:text-SmartMess-dark-error text-sm px-3 py-1 rounded-full font-medium">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          
          {/* Email */}
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted flex-shrink-0" />
            <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted line-clamp-1">
              {user.email}
            </p>
          </div>
          
          {/* Meals Left */}
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary flex-shrink-0" />
            <span className="text-sm font-semibold text-SmartMess-light-text dark:SmartMess-dark-text-secondary dark:text-SmartMess-light-text dark:SmartMess-dark-text-secondary">
              {user.meals} meals left
            </span>
          </div>
        </div>

        {/* Footer Section with Status and Payment */}
        <div className="mt-4 pt-4 border-t SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
          <div className="flex items-center justify-between">
            {/* Payment Status */}
            <div className={`px-4 py-2 rounded-full flex items-center space-x-2 border ${getStatusBadgeBackground(user.paymentStatus)} shadow-sm`}>
              <div className={`w-3 h-3 rounded-full ${getStatusIndicatorColor(user.paymentStatus)} shadow-sm`} />
              <span className={`text-sm font-bold ${getPaymentStatusColor(user.paymentStatus)}`}>
                {user.paymentStatus}
              </span>
            </div>
            
            {/* Payment Amount */}
            {user.paymentAmount && (
              <div className="flex items-center space-x-2 bg-SmartMess-light-error/10 dark:bg-SmartMess-dark-error/20 px-3 py-2 rounded-lg border border-SmartMess-light-error/20 dark:border-SmartMess-dark-error/30">
                <DollarSign className="w-4 h-4 text-SmartMess-light-error dark:text-SmartMess-dark-error flex-shrink-0" />
                <span className="text-sm font-bold text-SmartMess-light-error dark:text-SmartMess-dark-error">
                  ${user.paymentAmount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard; 