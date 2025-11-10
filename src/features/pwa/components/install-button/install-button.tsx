import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function PWAInstallButton({ 
  className = '', 
  variant = 'default',
  size = 'default'
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setIsInstallable(false);
      } else {
        setIsInstalled(false);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    checkInstallation();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
    } catch (error) {
      console.error('PWA: Error during install:', error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  // Don't render if app is already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      Install App
    </Button>
  );
}
