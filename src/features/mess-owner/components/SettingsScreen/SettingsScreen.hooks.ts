import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme/theme-provider';
import { authService } from '@/services/authService';
import { handleLogout as logoutUtil } from '@/utils/logout';
import { useMessProfile } from '@/contexts/MessProfileContext';
import type { SettingsScreenProps, SettingsScreenState } from './SettingsScreen.types';
import { validatePhotoFile, getSettingsScreenErrorMessage } from './SettingsScreen.utils';

export const useSettingsScreen = ({ onNavigate, onPhotoUpload, onPhotoDelete, onLogout }: SettingsScreenProps = {}) => {
  const navigate = useNavigate();
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<SettingsScreenState>({
    isDarkMode,
    loading: false,
    error: null,
    uploadProgress: null,
    isInitialized: false
  });

  // Use shared mess profile context
  const { 
    photo, 
    loading: photoLoading, 
    error: photoError, 
    uploadProgress, 
    handlePhotoChange: contextHandlePhotoChange, 
    handleDeletePhoto: contextHandleDeletePhoto, 
    messProfile,
    isInitialized
  } = useMessProfile();

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isDarkMode,
      loading: photoLoading,
      error: photoError,
      uploadProgress,
      isInitialized
    }));
  }, [isDarkMode, photoLoading, photoError, uploadProgress, isInitialized]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logoutUtil(navigate);
    }
  };

  const handlePhotoClick = () => {
    if (!state.loading) {
      fileInputRef.current?.click();
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePhotoFile(file);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.error || 'Invalid file'
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      if (onPhotoUpload) {
        await onPhotoUpload(file);
      } else {
        await contextHandlePhotoChange(e);
      }
    } catch (error) {
      const errorMessage = getSettingsScreenErrorMessage(error);
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      if (onPhotoDelete) {
        await onPhotoDelete();
      } else {
        await contextHandleDeletePhoto();
      }
    } catch (error) {
      const errorMessage = getSettingsScreenErrorMessage(error);
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state.loading && photo) {
      if (window.confirm('Are you sure you want to delete this photo?')) {
        handleDeletePhoto();
      }
    }
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const toggleSidebar = () => {
    // This function is kept for compatibility but no longer needed
    // since sidebar is always open
  };

  const user = authService.getCurrentUser();

  return {
    // State
    isDarkMode: state.isDarkMode,
    loading: state.loading,
    error: state.error,
    uploadProgress: state.uploadProgress,
    isInitialized: state.isInitialized,
    user,
    fileInputRef,
    photo,
    messProfile,
    
    // Actions
    toggleSidebar,
    toggleTheme: toggleDarkMode,
    handleLogout,
    handlePhotoClick,
    handlePhotoChange,
    handleDeletePhoto,
    handleDeleteClick,
    handleNavigate
  };
};
