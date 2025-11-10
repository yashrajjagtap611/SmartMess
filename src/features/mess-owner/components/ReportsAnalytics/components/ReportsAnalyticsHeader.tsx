import React from 'react';

const ReportsAnalyticsHeader: React.FC = () => {
  return (
    <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
      {/* Mobile/Tablet Layout - Centered Title */}
      <div className="flex items-center justify-center w-full lg:hidden">
        <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
          Reports & Analytics
        </h1>
      </div>
      {/* Desktop/Laptop Layout - Professional Alignment */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex items-center space-x-6 px-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              Reports & Analytics
            </h1>
            <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              View your reports and analytics
            </p>
          </div>
        </div>
        {/* Right Section - (empty for now) */}
        <div className="flex items-center space-x-3 pr-6"></div>
      </div>
    </header>
  );
};

export default ReportsAnalyticsHeader;
