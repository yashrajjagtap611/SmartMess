import React from 'react';
import MessVerificationScanner from '../MessVerificationScanner/MessVerificationScanner';
import { CommonHeader } from '@/components/common/Header/CommonHeader';

const MealScannerPage: React.FC = () => {
  const handleVerificationComplete = (result: { success: boolean; message: string }) => {
    console.log('Verification result:', result);
  };

  return (
    <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg pb-20">
      {/* Header */}
      <CommonHeader
        title="Mess Verification"
        subtitle="Scan the mess QR code to verify your active membership"
        variant="default"
      >
        <div className="hidden sm:flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Ready</span>
        </div>
      </CommonHeader>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Verification Scanner */}
        <MessVerificationScanner onScanComplete={handleVerificationComplete} />

        {/* Instructions */}
        <div className="rounded-xl border border-border bg-card transition-all p-4 sm:p-6">
          <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">How to Verify</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">1</span>
              </div>
              <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Find QR Code</h4>
              <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                Locate the QR code displayed at your mess entrance or reception desk
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">2</span>
              </div>
              <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Scan Code</h4>
              <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                Use your camera to scan the QR code (like scanning GPay QR)
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">3</span>
              </div>
              <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Get Verified</h4>
              <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                View your membership status and active plans instantly
              </p>
            </div>
          </div>
        </div>

        {/* What Gets Verified */}
        <div className="rounded-xl border border-border bg-card transition-all p-4 sm:p-6">
          <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">What Gets Verified</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Active Membership Status</h4>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">System checks if you have an active subscription</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Your Active Plans</h4>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">View all your active meal plans and validity dates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Subscription Period</h4>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Confirms if you're within your subscription period</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-4 sm:p-6">
          <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick & Easy Verification
          </h3>
          <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mb-4">
            Just like scanning a GPay QR code! No need to show ID cards or wait for manual verification. 
            Scan once and you can verify multiple times throughout your subscription period.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Instant Verification
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Works Offline
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Secure & Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealScannerPage;
