import { useState, useEffect } from 'react';
import { WifiIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OfflineBannerProps {
  className?: string;
  dismissible?: boolean;
}

export default function OfflineBanner({ 
  className = '', 
  dismissible = true 
}: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Only show banner for authenticated users when offline
      if (isAuthenticated && !isDismissed) {
        // Banner visibility is handled by the render condition
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    if (!navigator.onLine && isAuthenticated && !isDismissed) {
      // Banner visibility is handled by the render condition
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, isDismissed]);

  // Don't show banner if online, not authenticated, or dismissed
  if (isOnline || !isAuthenticated || isDismissed) {
    return null;
  }

  return (
    <Alert 
      variant="default" 
      className={`border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <WifiIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <span className="font-medium">Offline Mode:</span> You're currently offline but can continue using the app. 
            Some features may be limited until you're back online.
          </AlertDescription>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
            aria-label="Dismiss offline banner"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  );
}







