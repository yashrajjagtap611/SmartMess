import { useState, useEffect } from 'react';
import messService from '@/services/api/messService';

interface UseSecuritySettingsReturn {
  profileVisible: boolean;
  contactVisible: boolean;
  ratingsVisible: boolean;
  currentPassword: string;
  newPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  setProfileVisible: (value: boolean) => void;
  setContactVisible: (value: boolean) => void;
  setRatingsVisible: (value: boolean) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setShowCurrentPassword: (value: boolean) => void;
  setShowNewPassword: (value: boolean) => void;
  handleUpdatePrivacy: () => Promise<void>;
  handleUpdatePassword: () => Promise<void>;
}

export const useSecuritySettings = (): UseSecuritySettingsReturn => {
  // Security State
  const [profileVisible, setProfileVisible] = useState(true);
  const [contactVisible, setContactVisible] = useState(true);
  const [ratingsVisible, setRatingsVisible] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load security settings on component mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await messService.getSecuritySettings();
      
      if (response.success && response.data) {
        const { privacy } = response.data;
        if (privacy) {
          setProfileVisible(privacy.profileVisible ?? true);
          setContactVisible(privacy.contactVisible ?? true);
          setRatingsVisible(privacy.ratingsVisible ?? true);
        }
      }
    } catch (err: any) {
      console.error('Failed to load security settings:', err);
      setError(err.message || 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrivacy = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await messService.updateSecuritySettings({
        privacy: {
          profileVisible,
          contactVisible,
          ratingsVisible
        }
      });
      
      setSuccess('Privacy settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to update privacy settings:', err);
      setError(err.message || 'Failed to update privacy settings');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!currentPassword || !newPassword) {
        setError('Please enter both current and new passwords');
        return;
      }

      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }

      await messService.updatePassword(currentPassword, newPassword);
      
      setSuccess('Password updated successfully!');
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to update password:', err);
      setError(err.message || 'Failed to update password');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  return {
    profileVisible,
    contactVisible,
    ratingsVisible,
    currentPassword,
    newPassword,
    showCurrentPassword,
    showNewPassword,
    loading,
    saving,
    error,
    success,
    setProfileVisible,
    setContactVisible,
    setRatingsVisible,
    setCurrentPassword,
    setNewPassword,
    setShowCurrentPassword,
    setShowNewPassword,
    handleUpdatePrivacy,
    handleUpdatePassword,
  };
};






