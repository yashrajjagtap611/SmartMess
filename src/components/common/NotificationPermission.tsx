import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationPermissionProps {
  className?: string;
  showDetails?: boolean;
}

export default function NotificationPermission({ 
  className = '', 
  showDetails = false 
}: NotificationPermissionProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const checkSupport = () => {
      const supported = 'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    setIsRequesting(true);
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('🔔 Notification permission granted');
        // Register for push notifications
        await registerForPushNotifications();
      } else {
        console.log('🔕 Notification permission denied');
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (!existingSubscription) {
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(import.meta.env['VITE_VAPID_PUBLIC_KEY'] || '')
          });
          
          console.log('📱 Push notification subscription created:', subscription);
          
          // Send subscription to server
          await sendSubscriptionToServer(subscription);
        }
      }
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: localStorage.getItem('userId') // Get from your auth system
        })
      });
      
      if (response.ok) {
        console.log('✅ Subscription sent to server');
      } else {
        console.error('❌ Failed to send subscription to server');
      }
    } catch (error) {
      console.error('❌ Error sending subscription to server:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) {
    return showDetails ? (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          Notifications are not supported in this browser.
        </AlertDescription>
      </Alert>
    ) : null;
  }

  if (permission === 'granted') {
    return showDetails ? (
      <div className={`flex items-center gap-2 text-green-600 dark:text-green-400 ${className}`}>
        <BellIcon className="h-4 w-4" />
        <span className="text-sm">Notifications enabled</span>
      </div>
    ) : null;
  }

  if (permission === 'denied') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          Notifications are blocked. Please enable them in your browser settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Alert>
        <AlertDescription>
          Enable notifications to receive updates about meals, payments, and announcements.
        </AlertDescription>
      </Alert>
      
      <Button
        onClick={requestPermission}
        disabled={isRequesting}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <BellIcon className="h-4 w-4" />
        {isRequesting ? 'Requesting...' : 'Enable Notifications'}
      </Button>
    </div>
  );
} 