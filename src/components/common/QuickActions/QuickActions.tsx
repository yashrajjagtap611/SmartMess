import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  CalendarDaysIcon, 
  UserGroupIcon,
  BellIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  hasPendingPayments: boolean;
  hasOverduePayments: boolean;
  onPayBills: () => void;
  onApplyLeave: () => void;
  onViewCommunity: () => void;
  onViewNotifications: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  hasPendingPayments,
  hasOverduePayments,
  onPayBills,
  onApplyLeave,
  onViewCommunity,
  onViewNotifications,
  isDarkMode = false,
  onToggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const actions = [
    {
      id: 'pay-bills',
      title: 'Pay Bills',
      icon: CreditCardIcon,
      onClick: onPayBills,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      hoverColor: 'hover:bg-primary/20',
      description: 'Make payments for your mess subscription'
    },
    {
      id: 'apply-leave',
      title: 'Apply Leave',
      icon: CalendarDaysIcon,
      onClick: onApplyLeave,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      description: 'Request leave from your meal plan'
    },
    {
      id: 'community',
      title: 'Community',
      icon: UserGroupIcon,
      onClick: onViewCommunity,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      description: 'Connect with other mess members'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: BellIcon,
      onClick: onViewNotifications,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
      description: 'View your notifications and alerts'
    }
  ];

  return (
    <>
      {/* Payment Alerts */}
      <div className="space-y-4 mb-6">
        {hasPendingPayments && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Payment Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your mess subscription payment is pending. Please complete the payment to continue enjoying mess services.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {hasOverduePayments && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">Payment Overdue</h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Your mess subscription payment is overdue. Please make the payment immediately to avoid service suspension.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Quick Actions Grid */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Quick Actions
          </h2>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-foreground" />
              ) : (
                <MoonIcon className="w-5 h-5 text-foreground" />
              )}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`p-4 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 border border-border group ${action.bgColor} ${action.hoverColor}`}
            >
              <action.icon className={`w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform ${action.color}`} />
              <p className="text-sm font-medium text-foreground">
                {action.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        {/* Floating Action Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform ${
            isMobileMenuOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-45' 
              : 'bg-primary hover:bg-primary/90 hover:scale-110'
          }`}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-white mx-auto" />
          ) : (
            <PlusIcon className="w-6 h-6 text-white mx-auto" />
          )}
        </button>

        {/* Quick Actions Card */}
        {isMobileMenuOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-card rounded-2xl shadow-2xl border border-border p-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                {onToggleTheme && (
                  <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDarkMode ? (
                      <SunIcon className="w-4 h-4 text-foreground" />
                    ) : (
                      <MoonIcon className="w-4 h-4 text-foreground" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Choose an action to get started</p>
            </div>
            
            <div className="space-y-3">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.onClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-4 rounded-xl border border-border group ${action.bgColor} ${action.hoverColor} transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuickActions;

