import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
      <div className="flex items-center justify-center w-full lg:hidden">
        <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
          Mess Owner Dashboard
        </h1>
      </div>
      <div className="hidden lg:flex items-center justify-between w-full">
        <div className="flex items-center space-x-6 px-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              Mess Owner Dashboard
            </h1>
            <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              Manage your mess owner dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 pr-6"></div>
      </div>
    </header>
  );
};

export default DashboardHeader;






