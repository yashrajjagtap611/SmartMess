import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import type { MessInfoProps, MessInfoData } from '../SettingsScreen.types';
import { formatMessInfo } from '../SettingsScreen.utils';

export const MessInfo: React.FC<MessInfoProps> = ({ messProfile }) => {
  const messInfo: MessInfoData = formatMessInfo(messProfile);

  return (
    <div className="w-full max-w-md flex flex-col items-center mb-8">
      <div className="flex items-center gap-6 mt-3">
        <div className="flex items-center gap-1">
          <UserIcon className="h-4 w-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
          <span className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
            {messInfo.colleges.length} Colleges
          </span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <polygon points="10,1.5 12.59,7.36 18.9,7.97 14,12.14 15.45,18.36 10,15.1 4.55,18.36 6,12.14 1.1,7.97 7.41,7.36" />
          </svg>
          <span className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">{messInfo.rating} Rating</span>
        </div>
      </div>
      {messInfo.location.city && (
        <div className="mt-2 text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
          📍 {messInfo.location.city}, {messInfo.location.state}
        </div>
      )}
    </div>
  );
};
