import React from 'react';
import ReportsAnalyticsHeader from './ReportsAnalyticsHeader';

const ReportsAnalyticsContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <ReportsAnalyticsHeader />
      <div className="px-6">
        <div className="bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg shadow border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border p-6">
          <h2 className="text-lg font-semibold mb-4 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
            Reports & Analytics Dashboard
          </h2>
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
            Your reports and analytics content will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsContent;
