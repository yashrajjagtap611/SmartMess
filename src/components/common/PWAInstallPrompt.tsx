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
  variant?: 'banner' | 'modal' | 'inline' | 'top-popup';
  autoShow?: boolean;
  onDismiss?: () => void;
  autoHideDelay?: number; // Auto-hide delay in milliseconds (default: 5000ms = 5 seconds)
}

const PWA_INSTALLED_KEY = 'pwa_installed';

export default function PWAInstallPrompt({ 
  className = '', 
  variant = 'top-popup',
  autoShow = true,
  onDismiss,
  autoHideDelay = 5000 // 5 seconds default
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    let installPromptEvent: BeforeInstallPromptEvent | null = null;

    // Check if app is already installed
    const checkInstallation = () => {
      // Check localStorage first
      const installed = localStorage.getItem(PWA_INSTALLED_KEY) === 'true';
      
      if (installed || window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowPrompt(false);
        if (installed) {
          localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        }
        return true;
      } else {
        setIsInstalled(false);
        return false;
      }
    };

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      installPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installPromptEvent);
      setIsInstallable(true);
      
      console.log('PWA: beforeinstallprompt event received');
      
      // Wait for service worker to be ready before showing prompt
      waitForServiceWorker().then(() => {
        if (mounted && autoShow && !isInstalled) {
          setShowPrompt(true);
          setTimeout(() => setIsVisible(true), 100);
        }
      });
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowPrompt(false);
      setIsVisible(false);
      setDeferredPrompt(null);
      installPromptEvent = null;
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
    };

    // Wait for service worker to be ready
    const waitForServiceWorker = async (): Promise<boolean> => {
      if (!('serviceWorker' in navigator)) {
        console.log('PWA: Service worker not supported');
        return false;
      }

      try {
        // Check if service worker is already active
        if (navigator.serviceWorker.controller) {
          console.log('PWA: Service worker already active');
          return true;
        }

        // Wait for service worker to be ready (with shorter timeout for mobile)
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration>((_, reject) => 
            setTimeout(() => reject(new Error('Service worker timeout')), 3000)
          )
        ]);

        if (registration && mounted) {
          console.log('PWA: Service worker ready');
          return true;
        }
        return false;
      } catch (error) {
        console.warn('PWA: Service worker not ready:', error);
        // Still allow install prompt even if service worker takes time
        // Some browsers might not have service worker but still support PWA install
        return true;
      }
    };

    // Check installation status
    const isAlreadyInstalled = checkInstallation();
    
    if (isAlreadyInstalled) {
      return;
    }

    // For mobile browsers, wait a bit longer and check service worker
    const initializePWA = async () => {
      // Wait for service worker to be ready (with shorter timeout for mobile)
      const swReady = await waitForServiceWorker();
      
      // Check if we have deferred prompt or if we should show prompt anyway
      if (mounted && !isInstalled) {
        // If we have a deferred prompt, show it immediately
        if (installPromptEvent || deferredPrompt) {
          setIsInstallable(true);
          if (autoShow) {
            setShowPrompt(true);
            setTimeout(() => setIsVisible(true), 200);
          }
        } else if (swReady) {
          // Service worker is ready but no prompt yet - show install button anyway
          // This helps on mobile where beforeinstallprompt might be delayed
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          if (isMobile && autoShow) {
            // On mobile, show prompt after shorter delay if service worker is ready
            setTimeout(() => {
              if (mounted && !isInstalled && !installPromptEvent) {
                setIsInstallable(true);
                setShowPrompt(true);
                setTimeout(() => setIsVisible(true), 200);
              }
            }, 1000); // 1 second delay for mobile
          } else if (autoShow) {
            // Desktop - show after service worker is ready
            setIsInstallable(true);
            setShowPrompt(true);
            setTimeout(() => setIsVisible(true), 200);
          }
        }
      }
    };

    // Initialize after a short delay to ensure page is loaded
    const initTimeout = setTimeout(initializePWA, 300);

    // Listen for install prompt events
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, isInstalled, deferredPrompt]);

  // Auto-hide after delay
  useEffect(() => {
    if (showPrompt && isVisible && variant === 'top-popup') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Hide the prompt after animation
        setTimeout(() => setShowPrompt(false), 300);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [showPrompt, isVisible, autoHideDelay, variant]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for mobile browsers that might not have deferredPrompt
      // Try to trigger native install prompt
      console.log('PWA: No deferred prompt, checking if installable...');
      
      // Check if we can show install instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS Safari - show instructions
        alert('To install this app:\n1. Tap the Share button\n2. Tap "Add to Home Screen"');
        return;
      } else if (isAndroid && !deferredPrompt) {
        // Android - might need to wait a bit more
        console.log('PWA: Waiting for install prompt on Android...');
        setIsInstalling(false);
        return;
      }
      
      return;
    }

    setIsInstalling(true);
    
    try {
      console.log('PWA: Showing install prompt...');
      
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
        setIsVisible(false);
        setTimeout(() => setShowPrompt(false), 300);
        localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      } else {
        console.log('PWA: User dismissed the install prompt');
        // Don't set dismissed - show again next time
      }
    } catch (error) {
      console.error('PWA: Error during install:', error);
      // On error, don't keep the button disabled
    } finally {
      setIsInstalling(false);
      // Don't clear deferredPrompt immediately - might be needed again
      // setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Hide after animation
    setTimeout(() => {
      setShowPrompt(false);
      onDismiss?.();
    }, 300);
    // Note: We don't save dismissed state - it will show again next time
  };

  // Don't render if app is already installed or not installable
  if (isInstalled || !isInstallable || !showPrompt) {
    return null;
  }

  // Top popup variant - slides down from top (toast-like)
  if (variant === 'top-popup') {
    return (
      <div 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-[420px] w-full mx-4 pointer-events-auto ${
          isVisible 
            ? 'animate-in slide-in-from-top-2 fade-in duration-300' 
            : 'animate-out slide-out-to-top-2 fade-out duration-200 pointer-events-none'
        } ${className}`}
      >
        <div className="group relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-lg border bg-card/95 backdrop-blur-sm border-border text-foreground shadow-xl ring-1 ring-border/50 p-4 pr-10 transition-all">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold leading-none tracking-tight truncate">
                Install SmartMess
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                Get the app for a better experience
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleInstallClick}
              disabled={isInstalling || !deferredPrompt}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-8 px-3 text-xs"
              title={!deferredPrompt ? 'Installation will be available shortly' : ''}
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </Button>
          </div>
          
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/70 opacity-70 transition-all hover:opacity-100 hover:bg-accent hover:text-accent-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
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