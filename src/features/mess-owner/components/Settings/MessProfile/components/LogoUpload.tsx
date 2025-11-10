import { useEffect } from "react";
import { CameraIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useToast } from "../../../../../../hooks/use-toast";
import { CachedCircularImage } from '../../../../../../components/ui/CachedImage';
import type { LogoUploadProps } from '../MessProfile.types';

export default function LogoUpload({
  photo,
  loading,
  error,
  uploadProgress,
  fileInputRef,
  onLogoClick,
  onLogoChange,
}: LogoUploadProps) {
  const { toast } = useToast();

  // Show toast for upload success
  useEffect(() => {
    if (uploadProgress && !loading) {
      toast({
        title: "Upload Complete",
        description: uploadProgress,
        variant: "default",
      });
    }
  }, [uploadProgress, loading, toast]);

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

  // Show toast for upload progress
  useEffect(() => {
    if (loading && uploadProgress) {
      toast({
        title: "Uploading...",
        description: uploadProgress,
        variant: "default",
      });
    }
  }, [loading, uploadProgress, toast]);

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-gradient-to-br from-background to-muted dark:from-card dark:to-muted rounded-2xl border SmartMess-light-border dark:SmartMess-dark-border backdrop-blur-sm">
      {/* Main Upload Area */}
      <div className="relative group">
        {/* Upload Circle */}
        <div 
          className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-card to-background dark:from-card dark:to-background flex items-center justify-center overflow-hidden border-4 SmartMess-light-border dark:SmartMess-dark-border group-hover:border-primary transition-all duration-300 hover:scale-105 cursor-pointer group shadow-lg" 
          onClick={onLogoClick} 
          tabIndex={0} 
          role="button" 
          aria-label="Upload mess logo"
        >
          {photo ? (
            <CachedCircularImage 
              src={photo} 
              alt="Mess Logo" 
              className="object-cover w-full h-full rounded-full" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary group-hover:text-primary transition-colors duration-300">
              <PhotoIcon className="h-12 w-12 md:h-16 md:w-16" />
              <span className="text-xs md:text-sm font-medium">Upload Logo</span>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-300 rounded-full flex items-center justify-center">
            <CameraIcon className="h-8 w-8 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={onLogoClick}
          className="absolute -bottom-2 -right-2 p-3 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground border-4 border-background dark:border-card shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-foreground/50 rounded-full flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-background border-t-transparent"></div>
              <span className="text-background text-xs font-medium">Uploading...</span>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onLogoChange}
        />
      </div>

      {/* Upload Instructions */}
      <div className="text-center space-y-2">
        <h3 className="text-lg md:text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text">
          Mess Logo
        </h3>
        <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary max-w-xs">
          Upload a professional logo for your mess. Recommended size: 512x512px
        </p>
      </div>
    </div>
  );
}






