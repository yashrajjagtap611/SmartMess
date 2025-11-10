import React from "react";
import { MessProfileProvider } from '@/contexts/MessProfileContext';
import { SettingsScreenContent } from './SettingsScreenContent';

const SettingsScreen: React.FC = () => {
  return (
    <MessProfileProvider>
      <SettingsScreenContent />
    </MessProfileProvider>
  );
};

export default SettingsScreen;
