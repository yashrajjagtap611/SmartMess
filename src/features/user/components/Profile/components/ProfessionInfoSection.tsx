import React from "react";
import {
  BriefcaseIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  ClockIcon,
  IdentificationIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ProfileFormData, UserProfile } from "../Profile.types";

interface ProfessionInfoSectionProps {
  profile: UserProfile;
  editForm: ProfileFormData;
  isEditing: boolean;
  isActive: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  setEditForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

const getDisplayValue = (value?: string | number | null) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${value}` : "Not provided";
  }
  return value && value.toString().trim().length > 0
    ? value
    : "Not provided";
};

export const ProfessionInfoSection: React.FC<ProfessionInfoSectionProps> = ({
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
        <h3 className="text-xl font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text flex items-center space-x-2">
          <BriefcaseIcon className="h-6 w-6" />
          <span>Profession Information</span>
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
            className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-SmartMess-primary text-black rounded-lg hover:bg-SmartMess-primary-dark transition-colors text-sm w-full sm:w-auto"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-4">
          {buildField({
            icon: (
              <BuildingStorefrontIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            ),
            label: "Company/Organization",
            value: editForm.professionInfo?.company || "",
            readOnlyValue: getDisplayValue(profile.professionInfo?.company),
            isEditing,
            onChange: (value) =>
              setEditForm((prev) => ({
                ...prev,
                professionInfo: {
                  ...prev.professionInfo,
                  company: value,
                },
              })),
            placeholder: "Enter company name",
          })}

          {buildField({
            icon: (
              <BriefcaseIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            ),
            label: "Designation/Job Title",
            value: editForm.professionInfo?.designation || "",
            readOnlyValue: getDisplayValue(profile.professionInfo?.designation),
            isEditing,
            onChange: (value) =>
              setEditForm((prev) => ({
                ...prev,
                professionInfo: {
                  ...prev.professionInfo,
                  designation: value,
                },
              })),
            placeholder: "e.g., Software Engineer, Manager",
          })}

          {buildField({
            icon: (
              <BuildingStorefrontIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            ),
            label: "Department",
            value: editForm.professionInfo?.department || "",
            readOnlyValue: getDisplayValue(profile.professionInfo?.department),
            isEditing,
            onChange: (value) =>
              setEditForm((prev) => ({
                ...prev,
                professionInfo: {
                  ...prev.professionInfo,
                  department: value,
                },
              })),
            placeholder: "Enter department name",
          })}
        </div>

        <div className="space-y-4">
          {buildField({
            icon: (
              <MapPinIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            ),
            label: "Work Location",
            value: editForm.professionInfo?.workLocation || "",
            readOnlyValue: getDisplayValue(profile.professionInfo?.workLocation),
            isEditing,
            onChange: (value) =>
              setEditForm((prev) => ({
                ...prev,
                professionInfo: {
                  ...prev.professionInfo,
                  workLocation: value,
                },
              })),
            placeholder: "Enter work location",
          })}

          {buildField({
            icon: (
              <ClockIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            ),
            label: "Years of Experience",
            value: String(editForm.professionInfo?.workExperience ?? 0),
            readOnlyValue: profile.professionInfo?.workExperience
              ? `${profile.professionInfo.workExperience} years`
              : "Not provided",
            isEditing,
            onChange: (value) =>
              setEditForm((prev) => ({
                ...prev,
                professionInfo: {
                  ...prev.professionInfo,
                  workExperience: Number(value) || 0,
                },
              })),
            placeholder: "Enter years of experience",
            type: "number",
          })}

          {buildField({
            icon: (
              <IdentificationIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            ),
            label: "Employee ID",
            value: editForm.professionInfo?.employeeId || "",
            readOnlyValue: getDisplayValue(profile.professionInfo?.employeeId),
            isEditing,
            onChange: (value) =>
              setEditForm((prev) => ({
                ...prev,
                professionInfo: {
                  ...prev.professionInfo,
                  employeeId: value,
                },
              })),
            placeholder: "Enter employee ID",
          })}

          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Joining Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.professionInfo?.joiningDate || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      professionInfo: {
                        ...prev.professionInfo,
                        joiningDate: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                />
              ) : (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {profile.professionInfo?.joiningDate
                    ? new Date(
                        profile.professionInfo.joiningDate
                      ).toLocaleDateString()
                    : "Not provided"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BuildFieldOptions {
  icon: React.ReactNode;
  label: string;
  value: string;
  readOnlyValue: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "number";
}

const buildField = ({
  icon,
  label,
  value,
  readOnlyValue,
  isEditing,
  onChange,
  placeholder,
  type = "text",
}: BuildFieldOptions) => (
  <div className="flex items-center space-x-3">
    {icon}
    <div className="flex-1">
      <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
        />
      ) : (
        <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
          {readOnlyValue}
        </p>
      )}
    </div>
  </div>
);

