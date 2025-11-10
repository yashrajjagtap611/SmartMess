// Component
export { default, default as WelcomeScreen } from './WelcomeScreen';

// Types
export type {
  WelcomeScreenProps,
  WelcomeScreenState,
  FeatureHighlight,
  PWAInstallPrompt,
  WelcomeScreenConfig
} from './WelcomeScreen.types';

// Hooks
export { useWelcomeScreen } from './WelcomeScreen.hooks';

// Utils
export {
  getWelcomeScreenConfig,
  getAllFeatures,
  getFeatureByIcon,
  validatePWAInstallPrompt,
  formatAppTitle,
  getWelcomeScreenErrorMessage,
  isPWAInstallable,
  getAppLogoPath
} from './WelcomeScreen.utils';









