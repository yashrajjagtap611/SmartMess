import React from "react";
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useMessProfileScreen } from '../MessProfile.hooks';
import MessProfileForm from './MessProfileForm';
import { Toaster } from "../../../../../../components/ui/toaster";
import type { MessProfileProps } from '../MessProfile.types';

const MessProfileContent: React.FC<MessProfileProps> = (props) => {
  const {
    messProfile,
    photo,
    loading,
    error,
    uploadProgress,
    validationErrors,
    saveStatus,
    saveMessage,
    isInitialized,
    isDarkMode,
    fileInputRef,
    handleMessProfileChange,
    handleLocationChange,
    handleAddCollege,
    handleRemoveCollege,
    handleMessTypeToggle,
    handleLogoClick,
    handleLogoChange,
    handleSubmit,
    handleLogout,
    toggleDarkMode,
    getCurrentLocation,
    isLoadingLocation,
  } = useMessProfileScreen(props);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        
        <div className="lg:ml-90 transition-all duration-300 pb-24 lg:pb-0">
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-6 p-8 SmartMess-light-surface dark:SmartMess-dark-surface dark:SmartMess-light-surface dark:SmartMess-dark-surface rounded-3xl shadow-2xl border SmartMess-light-border dark:SmartMess-dark-border">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text">
                  Loading Mess Profile
                </h2>
                <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                  Please wait while we fetch your mess details...
                </p>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted dark:from-background dark:to-muted transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      
      {/* Main Content Area */}
      <div className='lg:ml-90 transition-all duration-300 pb-24 lg:pb-0'>
        {/* Header */}
        <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md SmartMess-light-bg dark:SmartMess-dark-bg/80 border-b SmartMess-light-border dark:SmartMess-dark-border">
          {/* Mobile/Tablet Layout - Centered Title */}
          <div className="flex items-center justify-center w-full lg:hidden">
            <h1 className="text-xl md:text-2xl font-bold text-center SmartMess-light-text dark:SmartMess-dark-text">
              Mess Profile
            </h1>
          </div>
          {/* Desktop/Laptop Layout - Professional Alignment */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Left Section - Title and Breadcrumb */}
            <div className="flex items-center space-x-6 px-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
                  Mess Profile
                </h1>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                  Manage your mess information and settings
                </p>
              </div>
            </div>
            {/* Right Section - (empty for now) */}
            <div className="flex items-center space-x-3 pr-6"></div>
          </div>
        </header>

        {/* Enhanced Content Area */}
        <div className="p-4 md:p-6 lg:p-8 pb-20 lg:pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:SmartMess-light-primary dark:SmartMess-dark-primary/20 rounded-2xl border border-primary/20 dark:border-primary/30">
                <div className="p-2 rounded-full SmartMess-light-primary dark:SmartMess-dark-primary/20">
                  <svg className="h-5 w-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-primary-light">
                  Complete your mess profile to attract more students
                </span>
              </div>
            </div>

            {/* Form Container */}
            <div className="SmartMess-light-surface dark:SmartMess-dark-surface dark:SmartMess-light-surface dark:SmartMess-dark-surface rounded-3xl shadow-2xl border SmartMess-light-border dark:SmartMess-dark-border overflow-hidden">
              <MessProfileForm
                messProfile={messProfile}
                photo={photo}
                loading={loading}
                error={error}
                uploadProgress={uploadProgress}
                validationErrors={validationErrors}
                saveStatus={saveStatus}
                saveMessage={saveMessage}
                fileInputRef={fileInputRef}
                onMessProfileChange={handleMessProfileChange}
                onLocationChange={handleLocationChange}
                onAddCollege={handleAddCollege}
                onRemoveCollege={handleRemoveCollege}
                onMessTypeToggle={handleMessTypeToggle}
                onLogoClick={handleLogoClick}
                onLogoChange={handleLogoChange}
                onSubmit={handleSubmit}
                onGetCurrentLocation={getCurrentLocation}
                isLoadingLocation={isLoadingLocation}
              />
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default MessProfileContent;






