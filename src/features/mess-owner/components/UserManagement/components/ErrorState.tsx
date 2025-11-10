import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-sm mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-SmartMess-light-error/5 to-SmartMess-light-error/20 dark:from-SmartMess-dark-error/10 dark:to-SmartMess-dark-error/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-SmartMess-light-error dark:text-SmartMess-dark-error opacity-70" />
        </div>
        <h3 className="text-lg font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
          Error loading users
        </h3>
        <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm mb-4">
          {error}
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary-dark dark:bg-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary-dark text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ErrorState; 