import React from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useSplashScreen } from './SplashScreen.hooks';
import type { SplashScreenProps } from './SplashScreen.types';

const SplashScreen: React.FC<SplashScreenProps> = ({ onInitializationComplete, onError }) => {
  const {
    isDarkMode,
    loadingText,
    error,
  } = useSplashScreen({ 
    ...(onInitializationComplete ? { onInitializationComplete } : {}),
    ...(onError ? { onError } : {})
  });

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-messhub-dark-bg text-messhub-dark-text' : 'bg-messhub-light-bg text-messhub-light-text'
      }`}>
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            isDarkMode ? 'bg-messhub-dark-primary' : 'bg-messhub-light-primary'
          }`}>
            <MessageCircle size={32} className={isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-bg'} />
          </div>
          <h1 className="text-2xl font-bold mb-2">MessHub</h1>
          <p className="text-sm text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${
      isDarkMode ? 'bg-messhub-dark-bg text-messhub-dark-text' : 'bg-messhub-light-bg text-messhub-light-text'
    }`}>
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
          isDarkMode ? 'bg-messhub-dark-primary' : 'bg-messhub-light-primary'
        }`}>
          <MessageCircle size={32} className={isDarkMode ? 'text-messhub-dark-text' : 'text-messhub-light-bg'} />
        </div>
        <Loader2 className="animate-spin mb-4" size={32} />
        <h1 className="text-2xl font-bold mb-2">MessHub</h1>
        <p className="text-sm text-center">{loadingText}</p>
      </div>
    </div>
  );
};

export default SplashScreen;
