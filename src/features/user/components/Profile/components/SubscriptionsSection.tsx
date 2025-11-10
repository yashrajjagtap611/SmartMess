import React from "react";

interface SubscriptionsSectionProps {
  isActive: boolean;
}

export const SubscriptionsSection: React.FC<SubscriptionsSectionProps> = ({
  isActive,
}) => (
  <div
    className={`${
      isActive ? "block" : "hidden md:block"
    } bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl shadow-lg p-4 sm:p-6`}
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      My Meal Plan Subscriptions
    </h3>
    <div className="text-center py-8 text-gray-500">Coming Soon</div>
  </div>
);

