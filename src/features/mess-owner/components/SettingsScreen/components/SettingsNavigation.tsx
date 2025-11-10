import React from 'react';
import { 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import type { SettingsNavigationProps } from '../SettingsScreen.types';
import { getSettingsScreenConfig } from '../SettingsScreen.utils';

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({ onNavigate }) => {
  const config = getSettingsScreenConfig();
  const navigationItems = config.navigationItems;

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'BuildingStorefrontIcon':
        return BuildingStorefrontIcon;
      case 'UserGroupIcon':
        return UserGroupIcon;
      case 'ClockIcon':
        return ClockIcon;
      case 'ShieldCheckIcon':
        return ShieldCheckIcon;
      case 'CreditCardIcon':
        return CreditCardIcon;
      case 'QrCodeIcon':
        return QrCodeIcon;
      default:
        return BuildingStorefrontIcon;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white';
      case 'emerald':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white';
      case 'indigo':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white';
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationItems.map((item) => {
          const IconComponent = getIconComponent(item.icon);
          const colorClasses = getColorClasses(item.color);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className="flex items-center gap-3 p-4 rounded-xl SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-hover dark:SmartMess-dark-hover hover:border-primary hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className={`p-2 rounded-lg transition-colors flex items-center justify-center ${colorClasses}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold SmartMess-light-text dark:SmartMess-dark-text group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
