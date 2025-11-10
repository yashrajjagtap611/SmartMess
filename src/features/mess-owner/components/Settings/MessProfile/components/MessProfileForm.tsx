import { useEffect } from "react";
import { PlusIcon, XMarkIcon, InformationCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useToast } from "../../../../../../hooks/use-toast";
import LogoUpload from "./LogoUpload";
import type { MessProfileFormProps } from '../MessProfile.types';
import { getMessTypeOptions } from '../MessProfile.utils';

const messTypeOptions = getMessTypeOptions();

export default function MessProfileForm({
  messProfile,
  photo,
  loading,
  error,
  uploadProgress,
  validationErrors,
  saveStatus,
  saveMessage,
  fileInputRef,
  onMessProfileChange,
  onLocationChange,
  onAddCollege,
  onRemoveCollege,
  onMessTypeToggle,
  onLogoClick,
  onLogoChange,
  onSubmit,
  onGetCurrentLocation,
  isLoadingLocation = false,
}: MessProfileFormProps) {
  const { toast } = useToast();

  // Show toast notifications for status changes
  useEffect(() => {
    if (saveStatus === 'success' && saveMessage) {
      toast({
        title: "Profile Updated",
        description: saveMessage,
        variant: "default",
      });
    } else if (saveStatus === 'error' && saveMessage) {
      toast({
        title: "Update Failed",
        description: saveMessage,
        variant: "destructive",
      });
    }
  }, [saveStatus, saveMessage, toast]);

  // Show toast for validation errors
  useEffect(() => {
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        });
      });
    }
  }, [validationErrors, toast]);

  // Show toast for upload errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      {/* Mess Logo/Image */}
      <LogoUpload
        photo={photo}
        loading={loading}
        error={error}
        uploadProgress={uploadProgress}
        fileInputRef={fileInputRef}
        onLogoClick={onLogoClick}
        onLogoChange={onLogoChange}
      />

      {/* Basic Information Card */}
      <div className="SmartMess-light-surface dark:SmartMess-dark-surface dark:SmartMess-light-surface dark:SmartMess-dark-surface rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:SmartMess-light-primary dark:SmartMess-dark-primary/30">
            <InformationCircleIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
            Basic Information
          </h2>
        </div>

        {/* Mess Name */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold SmartMess-light-text dark:SmartMess-dark-text">
            Mess Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={messProfile.name}
            onChange={e => onMessProfileChange("name", e.target.value)}
            placeholder="e.g. The Green Mess, Student Mess"
            className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            maxLength={100}
          />
          <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
            {messProfile.name.length}/100 characters
          </p>
        </div>

        {/* Mess Type */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold SmartMess-light-text dark:SmartMess-dark-text">
            Mess Type <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-3 flex-wrap">
            {messTypeOptions.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onMessTypeToggle(type)}
                className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                  messProfile.types.includes(type)
                    ? 'SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground border-primary shadow-lg'
                    : 'SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-text dark:SmartMess-dark-text hover:border-primary hover:SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:hover:SmartMess-light-primary dark:SmartMess-dark-primary/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {messProfile.types.length === 0 && (
            <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
              Select at least one mess type
            </p>
          )}
        </div>
      </div>

      {/* Location Information Card */}
      <div className="SmartMess-light-surface dark:SmartMess-dark-surface dark:SmartMess-light-surface dark:SmartMess-dark-surface rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
              Location Details
            </h2>
          </div>
          {onGetCurrentLocation && (
            <button
              type="button"
              onClick={onGetCurrentLocation}
              disabled={isLoadingLocation}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text hover:border-primary hover:SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:hover:SmartMess-light-primary dark:SmartMess-dark-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPinIcon className={`h-5 w-5 ${isLoadingLocation ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isLoadingLocation ? 'Getting Location...' : 'Get Current Location'}
              </span>
              <span className="sm:hidden">
                {isLoadingLocation ? 'Loading...' : 'Location'}
              </span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Street/Area"
            value={messProfile.location.street}
            onChange={e => onLocationChange("street", e.target.value)}
            className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text">
                City/Town <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="City/Town"
                value={messProfile.location.city}
                onChange={e => onLocationChange("city", e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text">
                District
              </label>
              <input
                type="text"
                placeholder="District"
                value={messProfile.location.district}
                onChange={e => onLocationChange("district", e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text">
                State <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="State"
                value={messProfile.location.state}
                onChange={e => onLocationChange("state", e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text">
                Pincode <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Pincode"
                value={messProfile.location.pincode}
                onChange={e => onLocationChange("pincode", e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Country"
            value={messProfile.location.country}
            onChange={e => onLocationChange("country", e.target.value)}
            className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* Nearby Colleges Card */}
      <div className="SmartMess-light-surface dark:SmartMess-dark-surface dark:SmartMess-light-surface dark:SmartMess-dark-surface rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
            Nearby Colleges
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Add college/institution"
              value={messProfile.collegeInput}
              onChange={e => onMessProfileChange("collegeInput", e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAddCollege(); } }}
              className="flex-1 px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
            <button
              type="button"
              onClick={onAddCollege}
              className="px-6 py-4 rounded-xl SmartMess-light-primary dark:SmartMess-dark-primary hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {messProfile.colleges.map((college: string, idx: number) => (
              <span key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full SmartMess-light-primary dark:SmartMess-dark-primary/10 dark:SmartMess-light-primary dark:SmartMess-dark-primary/20 text-primary-light border border-primary/20 dark:border-primary/30 font-medium">
                {college}
                <button
                  type="button"
                  onClick={() => onRemoveCollege(idx)}
                  className="hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/10 dark:hover:bg-destructive/20"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          
          {messProfile.colleges.length === 0 && (
            <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
              Add at least one nearby college
            </p>
          )}
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="SmartMess-light-surface dark:SmartMess-dark-surface dark:SmartMess-light-surface dark:SmartMess-dark-surface rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
            <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
            Contact Information
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text" htmlFor="ownerPhone">
              Owner Phone
            </label>
            <input
              id="ownerPhone"
              type="tel"
              value={messProfile.ownerPhone}
              onChange={e => onMessProfileChange("ownerPhone", e.target.value)}
              placeholder="Phone number"
              className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              maxLength={15}
              pattern="[+]?\d{10,15}"
              autoComplete="tel"
            />
            <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Enter a valid phone number (10-15 digits, optional +)</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text" htmlFor="ownerEmail">
              Owner Email <span className="text-destructive">*</span>
            </label>
            <input
              id="ownerEmail"
              type="email"
              value={messProfile.ownerEmail}
              onChange={e => onMessProfileChange("ownerEmail", e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-4 rounded-xl border-2 SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              required
              autoComplete="email"
            />
            <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">A valid email is required for mess owner contact.</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pb-8">
        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className={`px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
            saveStatus === 'saving'
              ? 'bg-muted SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary cursor-not-allowed'
              : 'SmartMess-light-primary dark:SmartMess-dark-primary hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 text-primary-foreground hover:scale-105'
          }`}
        >
          {saveStatus === 'saving' ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
              Saving...
            </div>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}






