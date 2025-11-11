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

  // Helper function to set fallback profile
  const setFallbackProfile = (user: any) => {
    const fallbackProfileBase: UserProfile = {
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
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = authService.getCurrentUser();
      
      if (!user) {
        console.warn('No user found in auth service');
        setLoading(false);
        return;
      }

      console.log('Loading profile for user:', user.id);
      
      // Load additional profile data from API
      try {
        const response = await userService.getProfile();
        console.log('Profile API response:', response);
        
        if (response.success && response.data) {
          // Transform the API response to match our UserProfile type
          const userData: any = user;
          
          // Build profile object with required fields
          const profileData: any = {
            id: response.data.id || user.id,
            firstName: response.data.firstName || user.firstName || '',
            lastName: response.data.lastName || user.lastName || '',
            email: response.data.email || user.email || '',
            phone: response.data.phone || user.phone || '',
            role: response.data.role || user.role,
            isEmailVerified: response.data.isVerified !== undefined ? response.data.isVerified : (userData?.isEmailVerified || false),
            isPhoneVerified: userData?.isPhoneVerified || false,
            createdAt: response.data.createdAt || userData?.createdAt || new Date().toISOString(),
            updatedAt: response.data.updatedAt || userData?.updatedAt || new Date().toISOString()
          };
          
          // Add optional properties only if they have values
          // Extract dateOfBirth from userData using type-safe approach
          const userDob = userData ? (userData as any).dateOfBirth : undefined;
          // response.data has 'dob' field from API, not 'dateOfBirth'
          const apiDob = (response.data as any).dob || (response.data as any).dateOfBirth;
          const dobValue = apiDob || userDob;
          if (dobValue) {
            profileData.dateOfBirth = dobValue;
          }
          const addrValue = response.data.address || (userData && userData.address);
          if (addrValue) {
            profileData.address = addrValue;
          }
          if (userData && userData.college) {
            profileData.college = userData.college;
          }
          if (userData && userData.course) {
            profileData.course = userData.course;
          }
          if (response.data.avatar) {
            profileData.avatar = response.data.avatar;
          } else if (userData && userData.avatar) {
            profileData.avatar = userData.avatar;
          }
          
          const transformedProfile: UserProfile = profileData;
          
          console.log('Setting profile:', transformedProfile);
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
          console.warn('Profile API response not successful, using fallback:', response);
          // Fallback to current user data
          setFallbackProfile(user);
        }
      } catch (apiError: any) {
        console.error('Error fetching profile from API:', apiError);
        // Fallback to current user data if API fails
        console.log('Using fallback profile data from auth service');
        setFallbackProfile(user);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      // Try to use fallback data
      const user = authService.getCurrentUser();
      if (user) {
        setFallbackProfile(user);
      }
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