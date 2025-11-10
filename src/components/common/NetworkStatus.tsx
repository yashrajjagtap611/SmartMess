import { useState, useEffect } from 'react';
import { WifiIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NetworkStatusProps {
  showDetails?: boolean;
  className?: string;
  autoHide?: boolean;
  hideDelay?: number; // in milliseconds
}

export default function NetworkStatus({ 
  showDetails = false, 
  className = '', 
  autoHide = true,
  hideDelay = 5000 // 5 seconds default
}: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [effectiveType, setEffectiveType] = useState<string>('');
  const [downlink, setDownlink] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [lastStatus, setLastStatus] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    const updateNetworkStatus = () => {
      const currentStatus = navigator.onLine;
      
      // Only show indicator if status changed
      if (currentStatus !== lastStatus) {
        setIsOnline(currentStatus);
        setLastStatus(currentStatus);
        setIsVisible(true);
        
        if (currentStatus) {
          console.log('🌐 Network: Back online');
        } else {
          if (isAuthenticated) {
            console.log('📶 Network: Gone offline - continuing in offline mode');
          } else {
            console.log('📶 Network: Gone offline');
          }
        }
        
        // Auto-hide after delay if enabled
        if (autoHide) {
          setTimeout(() => {
            setIsVisible(false);
          }, hideDelay);
        }
      }
      
      // Get connection information if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setEffectiveType(connection?.effectiveType || 'unknown');
        setDownlink(connection?.downlink || 0);
      }
    };

    const handleOnline = () => {
      updateNetworkStatus();
    };

    const handleOffline = () => {
      updateNetworkStatus();
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection change listener
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [lastStatus, autoHide, hideDelay, isAuthenticated]);

  // Don't render anything if not visible and auto-hide is enabled
  if (autoHide && !isVisible) {
    return null;
  }

  if (!showDetails) {
    return (
      <Badge 
        variant={isOnline ? 'default' : 'destructive'}
        className={`gap-1 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
      >
        <WifiIcon className="h-3 w-3" />
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
    );
  }

  return (
    <div className={`space-y-2 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}>
      <Badge 
        variant={isOnline ? 'default' : 'destructive'}
        className="gap-1"
      >
        <WifiIcon className="h-3 w-3" />
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      
      {isOnline && effectiveType && (
        <div className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
          <div>Connection: {effectiveType}</div>
          {downlink > 0 && <div>Speed: {downlink} Mbps</div>}
        </div>
      )}
      
      {!isOnline && (
        <Alert variant={isAuthenticated ? "default" : "destructive"} className="text-xs">
          <AlertDescription>
            {isAuthenticated 
              ? "You're offline but can continue using the app. Some features may be limited until you're back online."
              : "You're currently offline. Some features may be limited."
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 