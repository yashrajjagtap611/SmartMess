import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationBadgeProps {
  count?: number;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick?: () => void;
}

export default function NotificationBadge({ 
  count = 0, 
  className = '', 
  variant = 'default',
  onClick 
}: NotificationBadgeProps) {
  const [notificationCount, setNotificationCount] = useState(count);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    // Listen for notification count changes
    const handleNotificationCountChange = (event: CustomEvent) => {
      setNotificationCount(event.detail.count || 0);
    };

    window.addEventListener('notification-count-change', handleNotificationCountChange as EventListener);

    return () => {
      window.removeEventListener('notification-count-change', handleNotificationCountChange as EventListener);
    };
  }, []);

  // Don't render if notifications are not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={onClick}
        className="relative p-2 rounded-full SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
        aria-label={`${notificationCount} notifications`}
      >
        <BellIcon className="h-5 w-5" />
        
        {notificationCount > 0 && (
          <Badge
            variant={variant}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
          >
            {notificationCount > 99 ? '99+' : notificationCount}
          </Badge>
        )}
      </button>
    </div>
  );
} 