import type { FeatureHighlight, WelcomeScreenConfig } from './WelcomeScreen.types';

export const getWelcomeScreenConfig = (): WelcomeScreenConfig => {
  return {
    features: [
      {
        id: 'mess-management',
        title: 'Smart Mess Management',
        description: 'Effortlessly manage meals, billing, and member activities in one place',
        icon: 'Smartphone'
      },
      {
        id: 'connect-collaborate',
        title: 'Community Connection',
        description: 'Connect with mess owners and members, chat, and build lasting relationships',
        icon: 'Globe'
      },
      {
        id: 'fast-reliable',
        title: 'Seamless Experience',
        description: 'Real-time updates, offline support, and lightning-fast performance',
        icon: 'Zap'
      }
    ],
    appStoreLink: 'https://your-app-store-link.com',
    termsLink: '/terms',
    privacyLink: '/privacy'
  };
};

export const getAllFeatures = (): FeatureHighlight[] => {
  return getWelcomeScreenConfig().features;
};

export const getFeatureByIcon = (icon: FeatureHighlight['icon']): FeatureHighlight | undefined => {
  return getAllFeatures().find(feature => feature.icon === icon);
};

export const validatePWAInstallPrompt = (prompt: Event): boolean => {
  return prompt && typeof (prompt as any).prompt === 'function';
};

export const formatAppTitle = (title: string): string => {
  return title.trim();
};

export const getWelcomeScreenErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred on the welcome screen';
};

export const isPWAInstallable = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getAppLogoPath = (isDarkMode: boolean): string => {
  return isDarkMode
    ? '/authImg/WelcomeDark.png'
    : '/authImg/WelcomeLight.png';
};
