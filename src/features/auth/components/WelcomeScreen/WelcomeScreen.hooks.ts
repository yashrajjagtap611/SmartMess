import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WelcomeScreenProps } from './WelcomeScreen.types';
import { 
  getWelcomeScreenConfig, 
  getAllFeatures,
  validatePWAInstallPrompt,
  isPWAInstallable
} from './WelcomeScreen.utils';

export const useWelcomeScreen = ({ onLogin, onSignUp, onInstallPWA, onDownloadApp }: WelcomeScreenProps = {}) => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const config = getWelcomeScreenConfig();
  const features = getAllFeatures();

  // Check if PWA is installable
  useEffect(() => {
    if (!isPWAInstallable()) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (validatePWAInstallPrompt(e)) {
        setDeferredPrompt(e);
        setIsInstallable(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);


  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate("/login");
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      navigate("/role-selection");
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt && validatePWAInstallPrompt(deferredPrompt)) {
      try {
        (deferredPrompt as any).prompt();
        const { outcome } = await (deferredPrompt as any).userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setIsInstallable(false);
        }
      } catch (error) {
        console.error('PWA installation failed:', error);
      }
    }
    
    if (onInstallPWA) {
      onInstallPWA();
    }
  };

  const handleDownloadApp = () => {
    if (onDownloadApp) {
      onDownloadApp();
    } else {
      window.open(config.appStoreLink, "_blank");
    }
  };

  // Note: appLogoPath will be handled by the component using global theme

  return {
    // state
    deferredPrompt,
    isInstallable,
    features,
    config,
    // actions
    handleLogin,
    handleSignUp,
    handleInstallPWA,
    handleDownloadApp,
  };
};
