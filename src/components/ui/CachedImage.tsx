import React, { useState, useEffect } from 'react';
import { useImagePreloader } from '../../hooks/useImagePreloader';

interface CachedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loadingClassName?: string;
  errorClassName?: string;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  onLoad,
  onError,
  loadingClassName = '',
  errorClassName = ''
}) => {
  const [showImage, setShowImage] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isLoaded, hasError: preloadError, preloadImage } = useImagePreloader();

  useEffect(() => {
    if (src) {
      setShowImage(false);
      setHasError(false);
      
      preloadImage(src)
        .then(() => {
          setShowImage(true);
          onLoad?.();
        })
        .catch(() => {
          setHasError(true);
          onError?.();
        });
    } else {
      setShowImage(false);
      setHasError(false);
    }
  }, [src, preloadImage, onLoad, onError]);

  // Show loading state
  if (!src || (!isLoaded && !hasError)) {
    return (
      <div className={`flex items-center justify-center bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface ${loadingClassName} ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show error state
  if (hasError || preloadError) {
    return (
      <div className={`flex items-center justify-center bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface ${errorClassName} ${className}`}>
        {fallbackIcon || (
          <svg className="w-8 h-8 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    );
  }

  // Show image
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover transition-opacity duration-300 ${showImage ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={() => setShowImage(true)}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
    />
  );
};

// Optimized version for circular images
export const CachedCircularImage: React.FC<CachedImageProps> = (props) => {
  return (
    <CachedImage
      {...props}
      className={`rounded-full ${props.className || ''}`}
      fallbackIcon={
        <svg className="w-8 h-8 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      }
    />
  );
}; 