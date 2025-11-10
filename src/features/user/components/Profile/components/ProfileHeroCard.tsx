import React from "react";
import {
  UserIcon,
  CameraIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { UserProfile } from "../Profile.types";

interface ProfileHeroCardProps {
  profile: UserProfile;
  getStatusColor: (status: string) => string;
  onShareProfile: () => void;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  profile,
  getStatusColor,
  onShareProfile,
  onAvatarUpload,
}) => {
  return (
    <div className="bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl shadow-lg overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-SmartMess-primary to-SmartMess-secondary"></div>

      <div className="relative px-6 pb-6">
        <div className="flex items-end justify-between -mt-16 mb-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-SmartMess-light-surface dark:SmartMess-dark-surface bg-SmartMess-light-border dark:SmartMess-dark-border dark:bg-SmartMess-light-border dark:SmartMess-dark-border flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="h-16 w-16 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
              )}
            </div>
            <label className="absolute bottom-2 right-2 p-2 bg-SmartMess-primary text-black rounded-full cursor-pointer hover:bg-SmartMess-primary-dark transition-colors">
              <CameraIcon className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex flex-wrap gap-2 justify-end">
              {profile.isStudent && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Student
                </span>
              )}
              {profile.isWorking && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Working
                </span>
              )}
            </div>
            {profile.messDetails && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  profile.messDetails.status
                )}`}
              >
                {profile.messDetails.status.charAt(0).toUpperCase() +
                  profile.messDetails.status.slice(1)}
              </span>
            )}
            {profile.isEmailVerified && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Email Verified
              </span>
            )}
            {profile.isPhoneVerified && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Phone Verified
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex flex-wrap gap-2">
                {profile.isStudent && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Student
                  </span>
                )}
                {profile.isWorking && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    Working
                  </span>
                )}
              </div>

              {(profile.course ||
                profile.college ||
                profile.studentInfo?.college ||
                profile.studentInfo?.course) && (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">
                  {profile.studentInfo?.course || profile.course || ""}
                  {(profile.studentInfo?.course || profile.course) &&
                    (profile.studentInfo?.college || profile.college) &&
                    " • "}
                  {profile.studentInfo?.college || profile.college || ""}
                </p>
              )}

              {profile.isWorking && profile.professionInfo?.designation && (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">
                  {profile.professionInfo.designation}
                  {profile.professionInfo.company &&
                    ` at ${profile.professionInfo.company}`}
                </p>
              )}
            </div>
            {profile.messDetails && (
              <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Member of {profile.messDetails.messName} since{" "}
                {new Date(
                  profile.messDetails.joinDate
                ).toLocaleDateString()}
              </p>
            )}
          </div>

          {profile?.messDetails?.messId && (
            <button
              onClick={onShareProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-SmartMess-primary text-black rounded-lg hover:bg-SmartMess-primary-dark transition-colors"
            >
              <ShareIcon className="h-4 w-4" />
              <span>Share Mess Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

