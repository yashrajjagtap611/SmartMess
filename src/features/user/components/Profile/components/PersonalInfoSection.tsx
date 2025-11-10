import React from "react";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { UserProfile, ProfileFormData } from "../Profile.types";

interface PersonalInfoSectionProps {
  profile: UserProfile;
  editForm: ProfileFormData;
  isEditing: boolean;
  isActive: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  setEditForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profile,
  editForm,
  isEditing,
  isActive,
  onEdit,
  onSave,
  onCancel,
  setEditForm,
}) => {
  return (
    <div
      className={`${
        isActive ? "block" : "hidden md:block"
      } bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl shadow-lg p-4 sm:p-6`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-xl font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
          Personal Information
        </h3>
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={onSave}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <CheckIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <XMarkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-3 py-1.5 bg-SmartMess-primary text-black rounded-lg hover:bg-SmartMess-primary-dark transition-colors text-sm w-full sm:w-auto justify-center sm:justify-start"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="mb-4 p-4 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
          <p className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
            Status:
          </p>
          <div className="flex flex-wrap gap-3">
            {profile.isStudent && (
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  Student
                </span>
              </div>
            )}
            {profile.isWorking && (
              <div className="flex items-center space-x-2">
                <BriefcaseIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  Working
                </span>
              </div>
            )}
            {!profile.isStudent && !profile.isWorking && (
              <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                No status selected
              </span>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mb-4 p-4 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
          <p className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
            Select your status: <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-3">
            At least one status must be selected
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isStudent}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  if (!newValue && !editForm.isWorking) {
                    return;
                  }
                  setEditForm((prev) => ({ ...prev, isStudent: newValue }));
                }}
                className="rounded"
              />
              <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                I am a student
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isWorking}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  if (!newValue && !editForm.isStudent) {
                    return;
                  }
                  setEditForm((prev) => ({ ...prev, isWorking: newValue }));
                }}
                className="rounded"
              />
              <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                I am working
              </span>
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Full Name
              </label>
              {isEditing ? (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="flex-1 mt-1 block w-full rounded-md SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="flex-1 mt-1 block w-full rounded-md SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {profile.firstName} {profile.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Email
              </label>
              <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                />
              ) : (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {profile.phone || "Not provided"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                />
              ) : (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : "Not provided"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Gender
              </label>
              {isEditing ? (
                <select
                  value={editForm.gender || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      gender: e.target.value
                        ? (e.target.value as "male" | "female" | "other")
                        : undefined,
                    }))
                  }
                  className="mt-1 block w-full rounded-md SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {profile.gender
                    ? profile.gender.charAt(0).toUpperCase() +
                      profile.gender.slice(1)
                    : "Not provided"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {profile.messDetails && (
            <div className="flex items-center space-x-3">
              <BuildingStorefrontIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Mess Name
                </label>
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {profile.messDetails.messName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

