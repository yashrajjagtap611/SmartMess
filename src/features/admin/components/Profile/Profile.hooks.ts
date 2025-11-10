import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdminProfile, AdminFormState, ProfileResponse } from './Profile.types';
import { validateAdminProfile } from './Profile.utils';


export const useAdminProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState<AdminFormState>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    department: '',
    gender: 'male'
  });

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use the existing user profile endpoint
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data: ProfileResponse = await response.json();
      
      if (data.success && data.data) {
        // Transform user profile data to admin profile format
        const userData = data.data;
        const adminProfileBase = {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          dateOfBirth: userData.dob || userData.dateOfBirth,
          role: userData.role === 'admin' ? ('admin' as const) : ('super-admin' as const),
          permissions: ['user_management', 'mess_management', 'system_settings', 'analytics'],
          lastLogin: userData.lastLogin || new Date().toISOString(),
          loginCount: 1,
          accountCreated: userData.createdAt || new Date().toISOString(),
          isActive: userData.status === 'active',
          department: 'IT Department',
          employeeId: 'EMP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          securityLevel: 'high' as const,
          gender: userData.gender || ('male' as const),
          isVerified: userData.isVerified || false,
          updatedAt: userData.updatedAt
        };

        const adminProfile = userData.avatar !== undefined 
          ? { ...adminProfileBase, avatar: userData.avatar } 
          : adminProfileBase;

        setProfile(adminProfile);
        setEditForm({
          firstName: adminProfile.firstName,
          lastName: adminProfile.lastName,
          phone: adminProfile.phone,
          address: adminProfile.address,
          dateOfBirth: adminProfile.dateOfBirth,
          department: adminProfile.department,
          ...(adminProfile.gender !== undefined ? { gender: adminProfile.gender } : {})
        });
      } else {
        throw new Error(data.message || 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);



  const updateProfile = useCallback(async (formData: AdminFormState) => {
    try {
      setIsSaving(true);
      
      // Validate form data
      const validation = validateAdminProfile(formData);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        return false;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use the existing user profile endpoint for updates
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        dob: formData.dateOfBirth,
        gender: formData.gender
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const data: ProfileResponse = await response.json();
      
      if (data.success && data.data) {
        // Update the profile state with the new data
        const userData = data.data;
        const updatedProfile: AdminProfile = {
          ...profile!,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          address: userData.address,
          dateOfBirth: userData.dob || userData.dateOfBirth,
          gender: userData.gender || 'male',
          updatedAt: userData.updatedAt
        };

        setProfile(updatedProfile);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
        return true;
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toast, profile]);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      // Use the existing user avatar endpoint
      const response = await fetch('/api/user/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload avatar: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.avatar) {
        setProfile(prev => prev ? { ...prev, avatar: data.data.avatar } : null);
        toast({
          title: "Success",
          description: "Profile picture updated successfully"
        });
        return true;
      } else {
        throw new Error(data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const handleCancel = useCallback(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        department: profile.department,
        ...(profile.gender !== undefined ? { gender: profile.gender } : {})
      });
    }
    setIsEditing(false);
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    isEditing,
    editForm,
    setEditForm,
    setIsEditing,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    handleCancel
  };
};

