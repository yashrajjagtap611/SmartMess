import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme/theme-provider';
import { authService } from '@/services/authService';
import userService from '@/services/api/userService';
import type { UserProfile, ProfileFormData } from './Profile.types';

export const useProfile = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    college: '',
    course: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = authService.getCurrentUser();
      if (user) {
        // Load additional profile data from API if needed
        const response = await userService.getProfile();
        if (response.success && response.data) {
          // Transform the API response to match our UserProfile type
          const transformedProfileBase = {
            id: response.data.id,
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            dateOfBirth: response.data.dob || '',
            address: response.data.address || '',
            college: '', // Not provided by userService
            course: '', // Not provided by userService
            role: response.data.role,
            isEmailVerified: true, // Assume verified since user is logged in
            isPhoneVerified: false, // Default to false
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt
          };
          
          // Conditionally add avatar and messDetails if they exist
          let transformedProfile: UserProfile = transformedProfileBase;
          if (response.data.avatar) {
            transformedProfile = { ...transformedProfile, avatar: response.data.avatar };
          }
          
          setProfile(transformedProfile);
          setFormData({
            firstName: transformedProfile.firstName || '',
            lastName: transformedProfile.lastName || '',
            email: transformedProfile.email || '',
            phone: transformedProfile.phone || '',
            dateOfBirth: transformedProfile.dateOfBirth || '',
            address: transformedProfile.address || '',
            college: transformedProfile.college || '',
            course: transformedProfile.course || ''
          });
        } else {
          // Fallback to current user data
          const fallbackProfileBase = {
            id: user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            dateOfBirth: user.dateOfBirth || '',
            address: user.address || '',
            college: user.college || '',
            course: user.course || '',
            role: user.role,
            isEmailVerified: user.isEmailVerified || false,
            isPhoneVerified: user.isPhoneVerified || false,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString()
          };
          
          // Conditionally add avatar if it exists
          let fallbackProfile: UserProfile = fallbackProfileBase;
          if (user.avatar) {
            fallbackProfile = { ...fallbackProfile, avatar: user.avatar };
          }
          
          setProfile(fallbackProfile);
          setFormData({
            firstName: fallbackProfile.firstName || '',
            lastName: fallbackProfile.lastName || '',
            email: fallbackProfile.email || '',
            phone: fallbackProfile.phone || '',
            dateOfBirth: fallbackProfile.dateOfBirth || '',
            address: fallbackProfile.address || '',
            college: fallbackProfile.college || '',
            course: fallbackProfile.course || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // Filter out undefined values to match UpdateProfileRequest type
      const updateData: Parameters<typeof userService.updateProfile>[0] = {
        ...(formData.firstName ? { firstName: formData.firstName } : {}),
        ...(formData.lastName ? { lastName: formData.lastName } : {}),
        ...(formData.phone ? { phone: formData.phone } : {}),
        // Avatar not in ProfileFormData - handled separately if needed
        ...(formData.address ? { address: formData.address } : {}),
        ...(formData.gender ? { gender: formData.gender } : {}),
        ...(formData.dateOfBirth ? { dob: formData.dateOfBirth } : {}),
      };
      const response = await userService.updateProfile(updateData);
      if (response.success) {
        setProfile(prev => prev ? { ...prev, ...formData } : null);
        setIsEditing(false);
        // You might want to show a success toast here
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // You might want to show an error toast here
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
        college: profile.college || '',
        course: profile.course || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    try {
      authService.logout();
    } catch (e) {
      // Ensure storage cleared even if service fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userRole');
      localStorage.removeItem('authExpires');
    }
    // Use location redirect as a fallback for components outside Router
    window.location.href = '/login';
  };

  return {
    // State
    isDarkMode,
    toggleDarkMode,
    profile,
    loading,
    saving,
    isEditing,
    setIsEditing,
    formData,
    
    // Functions
    loadProfile,
    handleSaveProfile,
    handleCancelEdit,
    handleInputChange,
    handleLogout
  };
};

export default useProfile;