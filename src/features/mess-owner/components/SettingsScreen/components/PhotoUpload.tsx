import React from 'react';
import { CameraIcon, HomeIcon } from '@heroicons/react/24/outline';
import { CachedCircularImage } from '@/components/ui/CachedImage';
import type { PhotoUploadProps } from '../SettingsScreen.types';

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photo,
  loading,
  error,
  uploadProgress,
  fileInputRef,
  onPhotoClick,
  onPhotoChange,
}) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative group">
        <div 
          className={`relative w-32 h-32 border-2 SmartMess-light-border dark:SmartMess-dark-border rounded-full overflow-hidden transition-all duration-300 ${
            loading ? 'opacity-50' : 'hover:border-primary hover:shadow-lg'
          }`}
        >
          {photo ? (
            <CachedCircularImage 
              src={photo} 
              alt="Mess Photo" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full SmartMess-light-surface dark:SmartMess-dark-surface flex items-center justify-center">
              <HomeIcon className="w-16 h-16 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
            </div>
          )}
          {/* Upload button - positioned inside the circle */}
          <button
            type="button"
            onClick={onPhotoClick}
            className={`absolute bottom-2 right-2 SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground rounded-full p-2.5 shadow-lg hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
            aria-label="Upload photo"
            disabled={loading}
          >
            <CameraIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={onPhotoChange}
          className="hidden"
          disabled={loading}
        />
      </div>
      {/* Status messages */}
      {loading && (
        <div className="mt-3 text-sm SmartMess-light-text dark:SmartMess-dark-text flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></div>
          {uploadProgress || 'Processing...'}
        </div>
      )}
      {uploadProgress && !loading && (
        <div className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium">
          {uploadProgress}
        </div>
      )}
      {error && (
        <div className="mt-3 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  );
};
