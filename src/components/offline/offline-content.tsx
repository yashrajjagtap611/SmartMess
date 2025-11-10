import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

interface OfflineContentProps {
  className?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export default function OfflineContent({ 
  className = '', 
  onRetry,
  onGoHome 
}: OfflineContentProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 text-center ${className}`}>
      <div className="max-w-md mx-auto space-y-6">
        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <WifiIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
            You're Offline
          </h1>
          <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
            Please check your internet connection and try again.
          </p>
        </div>

        {/* Features Available Offline */}
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">While offline, you can:</p>
              <ul className="text-sm space-y-1 text-left">
                <li>• View previously loaded meal plans</li>
                <li>• Access cached mess information</li>
                <li>• View your profile and settings</li>
                <li>• Use basic app features</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRetry}
            className="flex-1 gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex-1 gap-2"
          >
            <HomeIcon className="h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Network Status */}
        <div className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
          <p>Network status will be restored automatically when connection returns.</p>
        </div>
      </div>
    </div>
  );
} 