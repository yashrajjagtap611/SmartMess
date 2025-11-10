import React from "react";
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useNavigate } from 'react-router-dom';
import { handleLogout as logoutUtil } from '@/utils/logout';
import { usePaymentSettings } from '../Payment.hooks';
import PaymentForm from './PaymentForm';

const PaymentContent: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const {
    paymentSettings,
    loading,
    saving,
    error,
    success,
    handleSettingChange,
    handleSave,
  } = usePaymentSettings();

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  return (
    <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      
      {/* Main Content Area */}
      <div className='lg:ml-90 transition-all duration-300'>
        {/* Header */}
        <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md SmartMess-light-bg dark:SmartMess-dark-bg/80 border-b SmartMess-light-border dark:SmartMess-dark-border">
          {/* Mobile/Tablet Layout - Centered Title */}
          <div className="flex items-center justify-center w-full lg:hidden">
            <h1 className="text-xl md:text-2xl font-bold text-center SmartMess-light-text dark:SmartMess-dark-text">
              Payment Settings
            </h1>
          </div>
          {/* Desktop/Laptop Layout - Professional Alignment */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Left Section - Title and Breadcrumb */}
            <div className="flex items-center space-x-6 px-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
                  Payment Settings
                </h1>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                  Configure your payment methods and billing preferences
                </p>
              </div>
            </div>
            {/* Right Section - (empty for now) */}
            <div className="flex items-center space-x-3 pr-6"></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-6 max-w-4xl mx-auto pb-20 lg:pb-6">
          <PaymentForm
            paymentSettings={paymentSettings}
            loading={loading}
            saving={saving}
            error={error}
            success={success}
            onSettingChange={handleSettingChange}
            onSave={handleSave}
          />
        </div>
      </div>
      
      <div className="lg:hidden">
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default PaymentContent;
