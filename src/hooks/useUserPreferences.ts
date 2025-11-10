import { useState, useEffect, useCallback } from 'react';
import { userPreferencesAPI } from '../services/api';
import { UserPreferences, DietaryOption, AllergyOption, ThemeOption, LanguageCode } from '../types/user';

// Simple toast hook - you can replace this with your actual toast implementation
const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Replace with your actual toast implementation
  };
  return { showToast };
};

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateDietary: (dietary: DietaryOption[]) => Promise<void>;
  updateAllergies: (allergies: AllergyOption[]) => Promise<void>;
  updateMealTimes: (mealTimes: { breakfast?: string; lunch?: string; dinner?: string }) => Promise<void>;
  updateNotifications: (notifications: { email: boolean; push: boolean; sms: boolean }) => Promise<void>;
  updatePrivacy: (privacy: { profileVisibility: 'public' | 'private' | 'mess-only'; showEmail: boolean; showPhone: boolean }) => Promise<void>;
  updateTheme: (theme: ThemeOption) => Promise<void>;
  updateLanguage: (language: LanguageCode) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

export const useUserPreferences = (): UseUserPreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Load user preferences on mount
  useEffect(() => {
    refreshPreferences();
  }, []);

  const refreshPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.getPreferences();
      if (response.data.success) {
        setPreferences(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load preferences');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updatePreferences(newPreferences);
      if (response.data.success) {
        setPreferences(response.data.data);
        showToast('Preferences updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update preferences');
        showToast(response.data.message || 'Failed to update preferences', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update preferences';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateDietary = useCallback(async (dietary: DietaryOption[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updateDietary(dietary);
      if (response.data.success) {
        setPreferences(prev => prev ? { ...prev, dietary } : null);
        showToast('Dietary preferences updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update dietary preferences');
        showToast(response.data.message || 'Failed to update dietary preferences', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update dietary preferences';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating dietary preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateAllergies = useCallback(async (allergies: AllergyOption[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updateAllergies(allergies);
      if (response.data.success) {
        setPreferences(prev => prev ? { ...prev, allergies } : null);
        showToast('Allergy preferences updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update allergy preferences');
        showToast(response.data.message || 'Failed to update allergy preferences', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update allergy preferences';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating allergy preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateMealTimes = useCallback(async (mealTimes: { breakfast?: string; lunch?: string; dinner?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updateMealTimes(mealTimes);
      if (response.data.success) {
        setPreferences(prev => prev ? { ...prev, mealTimes } : null);
        showToast('Meal times updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update meal times');
        showToast(response.data.message || 'Failed to update meal times', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update meal times';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating meal times:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateNotifications = useCallback(async (notifications: { email: boolean; push: boolean; sms: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updateNotifications(notifications);
      if (response.data.success) {
        setPreferences(prev => prev ? { ...prev, notifications } : null);
        showToast('Notification preferences updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update notification preferences');
        showToast(response.data.message || 'Failed to update notification preferences', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update notification preferences';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating notification preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updatePrivacy = useCallback(async (privacy: { profileVisibility: 'public' | 'private' | 'mess-only'; showEmail: boolean; showPhone: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updatePrivacy(privacy);
      if (response.data.success) {
        setPreferences(prev => prev ? { ...prev, privacy } : null);
        showToast('Privacy preferences updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update privacy preferences');
        showToast(response.data.message || 'Failed to update privacy preferences', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update privacy preferences';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating privacy preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateTheme = useCallback(async (theme: ThemeOption) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updateTheme(theme);
      if (response.data.success) {
        setPreferences(prev => prev ? { ...prev, theme } : null);
        showToast('Theme updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update theme');
        showToast(response.data.message || 'Failed to update theme', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update theme';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating theme:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateLanguage = useCallback(async (language: LanguageCode) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.updateLanguage(language);
      if (response.data.success) {
        setPreferences(prev => prev ? { ...prev, language } : null);
        showToast('Language updated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to update language');
        showToast(response.data.message || 'Failed to update language', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update language';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating language:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateDietary,
    updateAllergies,
    updateMealTimes,
    updateNotifications,
    updatePrivacy,
    updateTheme,
    updateLanguage,
    refreshPreferences
  };
}; 