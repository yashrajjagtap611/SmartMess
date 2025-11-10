import type { LoadingMessage, AuthenticationCheck, SplashScreenConfig } from './SplashScreen.types';
import { ROUTES } from '@/constants/routes';

export const getSplashScreenConfig = (): SplashScreenConfig => {
  return {
    loadingMessages: [
      { text: 'Initializing...', duration: 1000 },
      { text: 'Loading components...', duration: 1000 },
      { text: 'Preparing your experience...', duration: 1000 },
      { text: 'Almost ready...', duration: 1000 }
    ],
    totalLoadingTime: 3000,
    checkInterval: 1000
  };
};

export const checkAuthenticationStatus = (): AuthenticationCheck => {
  try {
    // This would typically check localStorage, cookies, or auth service
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole') as 'admin' | 'mess-owner' | 'user' | null;
    
    const isAuthenticated = !!token;
    
    let redirectPath = ROUTES.PUBLIC.WELCOME;
    
    if (isAuthenticated && userRole) {
      switch (userRole) {
        case 'admin':
          redirectPath = ROUTES.ADMIN.DASHBOARD;
          break;
        case 'mess-owner':
          redirectPath = ROUTES.MESS_OWNER.DASHBOARD;
          break;
        case 'user':
          redirectPath = ROUTES.USER.DASHBOARD;
          break;
        default:
          redirectPath = ROUTES.PUBLIC.WELCOME;
      }
    }
    
    return {
      isAuthenticated,
      userRole,
      redirectPath
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      userRole: null,
      redirectPath: ROUTES.PUBLIC.WELCOME
    };
  }
};

export const getNextLoadingMessage = (
  messages: LoadingMessage[],
  currentIndex: number
): { message: LoadingMessage; nextIndex: number } => {
  const message = messages[currentIndex];
  if (!message) {
    // Fallback to first message if index is out of bounds
    return { message: messages[0] || { text: 'Loading...', duration: 1000 }, nextIndex: 0 };
  }
  const nextIndex = (currentIndex + 1) % messages.length;
  
  return { message, nextIndex };
};

export const formatLoadingText = (text: string): string => {
  return text.trim();
};

export const getSplashScreenErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred during initialization';
};

export const validateSplashScreenConfig = (config: SplashScreenConfig): boolean => {
  return (
    config.loadingMessages.length > 0 &&
    config.totalLoadingTime > 0 &&
    config.checkInterval > 0
  );
};
