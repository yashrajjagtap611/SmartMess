import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XMarkIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
  variant?: 'banner' | 'modal' | 'inline';
  autoShow?: boolean;
  onDismiss?: () => void;
}

export default function PWAInstallPrompt({ 
  className = '', 
  variant = 'banner',
  autoShow = true,
  onDismiss
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowPrompt(false);
      } else {
        setIsInstalled(false);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      if (autoShow) {
        setShowPrompt(true);
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    checkInstallation();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
        setShowPrompt(false);
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
    } catch (error) {
      console.error('PWA: Error during install:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  // Don't render if app is already installed or not installable
  if (isInstalled || !isInstallable || !showPrompt) {
    return null;
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Install SmartMess</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DevicePhoneMobileIcon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                  Install SmartMess on your device for a better experience
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1"
              >
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={isInstalling}
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <Alert className={className}>
        <DevicePhoneMobileIcon className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Install SmartMess for a better experience</span>
            <Button
              onClick={handleInstallClick}
              disabled={isInstalling}
              size="sm"
              variant="outline"
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Banner variant (default)
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Install SmartMess
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Get the app for a better experience
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstallClick}
            disabled={isInstalling}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}