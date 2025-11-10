import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { ProfileActivity } from "../Profile.types";

interface ActivitiesSectionProps {
  activities: ProfileActivity[];
  isActive: boolean;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
  isActive,
}) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div
      className={`${
        isActive ? "block" : "hidden md:block"
      } bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl shadow-lg p-4 sm:p-6`}
    >
      <h3 className="text-xl font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
        Recent Activities
      </h3>
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            className="flex items-center space-x-3 p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg"
          >
            <div
              className={`p-2 rounded-full ${
                activity.status === "success"
                  ? "bg-green-100 text-green-600"
                  : activity.status === "pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <BellIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                {activity.title}
              </p>
              <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                {activity.description}
              </p>
            </div>
            <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              {new Date(activity.timestamp).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

