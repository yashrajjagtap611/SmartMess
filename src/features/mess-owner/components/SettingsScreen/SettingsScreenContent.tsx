import React from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import CommonHeader from '@/components/common/Header/CommonHeader';
import { ROUTES } from '@/constants/routes';
import { useSettingsScreen } from './SettingsScreen.hooks';
import { PhotoUpload } from './components/PhotoUpload';
import { MessInfo } from './components/MessInfo';
import { SettingsNavigation } from './components/SettingsNavigation';
import type { SettingsScreenProps } from './SettingsScreen.types';

export const SettingsScreenContent: React.FC<SettingsScreenProps> = (props) => {
  const {
    isDarkMode,
    loading,
    error,
    uploadProgress,
    isInitialized,
    user,
    fileInputRef,
    photo,
    messProfile,

    toggleTheme,
    handleLogout,
    handlePhotoClick,
    handlePhotoChange,
    handleNavigate
  } = useSettingsScreen(props);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleTheme}
          handleLogout={handleLogout}
        />
        
        <div className="transition-all duration-300 lg:ml-90">
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="SmartMess-light-text dark:SmartMess-dark-text">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleTheme}
        handleLogout={handleLogout}
      />
      {/* Main Content Area */}
      <div className="transition-all duration-300 lg:ml-90">
        <CommonHeader
          title="Settings"
          subtitle="Manage your settings and profile details here."
          variant="default"
          showUserProfile={true}
          user={user}
          onUserProfileClick={() => handleNavigate(ROUTES.MESS_OWNER.PROFILE)}
        />
        {/* Content Area with proper bottom spacing */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6 pb-32 lg:pb-24 SmartMess-light-text dark:SmartMess-dark-text">
          <PhotoUpload
            photo={photo}
            loading={loading}
            error={error}
            uploadProgress={uploadProgress}
            fileInputRef={fileInputRef}
            onPhotoClick={handlePhotoClick}
            onPhotoChange={handlePhotoChange}
          />
          <MessInfo messProfile={messProfile} />
          <SettingsNavigation onNavigate={handleNavigate} />
        </div>
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleTheme}
        handleLogout={handleLogout}
      />
    </div>
  );
};
