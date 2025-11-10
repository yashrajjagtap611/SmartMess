import React from "react";
import {
  MapPinIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { UserProfile, ProfileFormData } from "../Profile.types";

interface AddressSectionProps {
  profile: UserProfile;
  editForm: ProfileFormData;
  isEditing: boolean;
  isActive: boolean;
  isLoadingLocation: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onGetLocation: () => void;
  setEditForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  profile,
  editForm,
  isEditing,
  isActive,
  isLoadingLocation,
  onEdit,
  onSave,
  onCancel,
  onGetLocation,
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
          <MapPinIcon className="h-6 w-6" />
          <span>Address Information</span>
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
          {isEditing && (
            <button
              onClick={onGetLocation}
              disabled={isLoadingLocation}
              className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-SmartMess-primary text-black rounded-lg hover:bg-SmartMess-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${isLoadingLocation ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isLoadingLocation ? "Getting Location..." : "Get Current Location"}
              </span>
              <span className="sm:hidden">Location</span>
            </button>
          )}
          {isEditing ? (
            <div className="flex items-center space-x-2">
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
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <MapPinIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              Street Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.currentAddress?.street || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    currentAddress: {
                      ...prev.currentAddress,
                      street: e.target.value,
                    },
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                placeholder="Enter street address"
              />
            ) : (
              <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                {profile.currentAddress?.street || "Not provided"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {[
          {
            label: "City",
            value: editForm.currentAddress?.city,
            display: profile.currentAddress?.city,
            key: "city",
          },
          {
            label: "Taluka",
            value: editForm.currentAddress?.taluka,
            display: (profile.currentAddress as any)?.taluka,
            key: "taluka",
          },
          {
            label: "District",
            value: editForm.currentAddress?.district,
            display: (profile.currentAddress as any)?.district,
            key: "district",
          },
          {
            label: "State",
            value: editForm.currentAddress?.state,
            display: profile.currentAddress?.state,
            key: "state",
          },
          {
            label: "Pincode",
            value: editForm.currentAddress?.pincode,
            display: profile.currentAddress?.pincode,
            key: "pincode",
            maxLength: 6,
            transform: (val: string) => val.replace(/\D/g, ""),
          },
          {
            label: "Country",
            value: editForm.currentAddress?.country || "India",
            display: profile.currentAddress?.country || "India",
            key: "country",
          },
        ].map(({ label, value, display, key, maxLength, transform }) => (
          <div className="flex items-start space-x-2" key={key}>
            <MapPinIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                {label}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) => {
                    const inputValue = transform ? transform(e.target.value) : e.target.value;
                    setEditForm((prev) => ({
                      ...prev,
                      currentAddress: {
                        ...prev.currentAddress,
                        [key]: inputValue,
                      },
                    }));
                  }}
                  maxLength={maxLength}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm py-1.5 px-2 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              ) : (
                <p className="text-xs sm:text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text truncate mt-1">
                  {display || "Not provided"}
                </p>
              )}
            </div>
          </div>
        ))}

        {[
          {
            label: "Latitude",
            value: editForm.currentAddress?.latitude,
            display: (profile.currentAddress as any)?.latitude
              ? (profile.currentAddress as any).latitude.toFixed(6)
              : "Not available",
            key: "latitude",
          },
          {
            label: "Longitude",
            value: editForm.currentAddress?.longitude,
            display: (profile.currentAddress as any)?.longitude
              ? (profile.currentAddress as any).longitude.toFixed(6)
              : "Not available",
            key: "longitude",
          },
        ].map(({ label, value, display, key }) => (
          <div className="flex items-start space-x-2" key={key}>
            <MapPinIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                {label}
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="any"
                  value={value ?? ""}
                  readOnly
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm py-1.5 px-2 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                  placeholder={label}
                />
              ) : (
                <p className="text-xs sm:text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text truncate mt-1">
                  {display}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

