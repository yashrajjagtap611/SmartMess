export interface WelcomeScreenProps {
  onLogin?: () => void;
  onSignUp?: () => void;
  onInstallPWA?: () => void;
  onDownloadApp?: () => void;
}

export interface WelcomeScreenState {
  isDarkMode: boolean;
  deferredPrompt: Event | null;
  isInstallable: boolean;
}

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  icon: 'Smartphone' | 'Globe' | 'Zap';
}

export interface PWAInstallPrompt {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface WelcomeScreenConfig {
  features: FeatureHighlight[];
  appStoreLink: string;
  termsLink: string;
  privacyLink: string;
}
