// Component
export { default, default as SplashScreen } from './SplashScreen';

// Types
export type {
  SplashScreenProps,
  SplashScreenState,
  LoadingMessage,
  AuthenticationCheck,
  SplashScreenConfig
} from './SplashScreen.types';

// Hooks
export { useSplashScreen } from './SplashScreen.hooks';

// Utils
export {
  getSplashScreenConfig,
  checkAuthenticationStatus,
  getNextLoadingMessage,
  formatLoadingText,
  getSplashScreenErrorMessage,
  validateSplashScreenConfig
} from './SplashScreen.utils';









