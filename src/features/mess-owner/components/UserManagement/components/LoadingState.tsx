import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
        <p className="text-SmartMess-light-text dark:SmartMess-dark-text-secondary dark:text-SmartMess-light-text dark:SmartMess-dark-text-secondary">
          Loading users...
        </p>
      </div>
    </div>
  );
};

export default LoadingState; 