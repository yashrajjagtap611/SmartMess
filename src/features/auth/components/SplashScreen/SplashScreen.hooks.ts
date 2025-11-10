import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SplashScreenProps } from './SplashScreen.types';
import { 
  getSplashScreenConfig, 
  checkAuthenticationStatus, 
  getNextLoadingMessage, 
  formatLoadingText,
  getSplashScreenErrorMessage,
  validateSplashScreenConfig
} from './SplashScreen.utils';

export const useSplashScreen = ({ onInitializationComplete, onError }: SplashScreenProps = {}) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const config = getSplashScreenConfig();
    
    if (!validateSplashScreenConfig(config)) {
      const errorMessage = 'Invalid splash screen configuration';
      setError(errorMessage);
      if (onError) {
        onError(new Error(errorMessage));
      }
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      const { message, nextIndex } = getNextLoadingMessage(config.loadingMessages, currentIndex);
      setLoadingText(formatLoadingText(message.text));
      currentIndex = nextIndex;
    }, config.checkInterval);

    // After total loading time, check authentication and redirect accordingly
    const timeout = setTimeout(() => {
      try {
        const authStatus = checkAuthenticationStatus();
        
        if (onInitializationComplete) {
          onInitializationComplete();
        }
        
        navigate(authStatus.redirectPath, { replace: true });
      } catch (error: unknown) {
        const errorMessage = getSplashScreenErrorMessage(error);
        setError(errorMessage);
        if (onError) {
          onError(new Error(errorMessage));
        }
        // Fallback to welcome page on error
        navigate('/welcome', { replace: true });
      } finally {
        setIsLoading(false);
      }
    }, config.totalLoadingTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onInitializationComplete, onError]); // Removed navigate to prevent infinite loops

  return {
    // state
    isDarkMode,
    loadingText,
    isLoading,
    error,
    // actions
    setIsDarkMode,
  };
};
