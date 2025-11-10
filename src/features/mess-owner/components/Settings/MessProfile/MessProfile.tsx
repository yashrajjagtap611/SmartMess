import React from "react";
import { MessProfileProvider } from '../../../../../contexts/MessProfileContext';
// import { useMessProfileScreen } from './MessProfile.hooks';
import MessProfileContent from './components/MessProfileContent';
import type { MessProfileProps } from './MessProfile.types';

const MessProfile: React.FC<MessProfileProps> = (props) => {
  return (
    <MessProfileProvider>
      <MessProfileContent {...props} />
    </MessProfileProvider>
  );
};

export default MessProfile;
