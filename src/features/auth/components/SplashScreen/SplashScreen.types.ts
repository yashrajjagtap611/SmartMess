export interface SplashScreenProps {
  onInitializationComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface SplashScreenState {
  isDarkMode: boolean;
  loadingText: string;
  isLoading: boolean;
  error: string | null;
}

export interface LoadingMessage {
  text: string;
  duration: number;
}

export interface AuthenticationCheck {
  isAuthenticated: boolean;
  userRole: 'admin' | 'mess-owner' | 'user' | null;
  redirectPath: string;
}

export interface SplashScreenConfig {
  loadingMessages: LoadingMessage[];
  totalLoadingTime: number;
  checkInterval: number;
}









