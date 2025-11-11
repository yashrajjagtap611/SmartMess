import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  MessOwnerProfile,
  MessProfileDetails,
  MessFormState,
  PersonalInfoForm,
  MessProfileApiResponse,
  UserProfileApiResponse,
  MessType,
  AccountStatus,
  Gender,
} from './Profile.types';
import {
  validatePersonalInfo,
  validateMessProfileForm,
  parseCollegesInput,
} from './Profile.utils';
import { type PlatformCharge } from '@/components/common/PlatformChargesSection';
import userService from '@/services/api/userService';
import { messAPI } from '@/services/api';
import apiClient from '@/services/api';

type UserProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender;
  dateOfBirth: string;
  avatar?: string;
  status: AccountStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

const VALID_MESS_TYPES: MessType[] = ['Veg', 'Non-Veg', 'Mixed'];

const defaultPersonalForm: PersonalInfoForm = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  gender: 'male',
  dob: '',
  status: 'active',
};

const defaultMessForm = (ownerEmail: string = ''): MessFormState => ({
  name: '',
  street: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  country: 'India',
  colleges: '',
  ownerPhone: '',
  ownerEmail,
  types: ['Mixed'],
});

const normaliseUserProfile = (data: any): UserProfileData => {
  const id = data?.id || data?._id || '';
  const status = (data?.status as AccountStatus) || 'active';
  const gender = (data?.gender as Gender) || 'male';

  return {
    id,
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    address: data?.address || '',
    gender,
    dateOfBirth: data?.dob || data?.dateOfBirth || '',
    avatar: data?.avatar,
    status,
    isVerified: Boolean(data?.isVerified),
    createdAt: data?.createdAt || new Date().toISOString(),
    updatedAt: data?.updatedAt || new Date().toISOString(),
  };
};

const sanitiseMessTypes = (types?: string[]): MessType[] => {
  if (!Array.isArray(types)) return ['Mixed'];
  const filtered = types
    .map((type) => type as MessType)
    .filter((type): type is MessType => VALID_MESS_TYPES.includes(type));
  return filtered.length > 0 ? filtered : ['Mixed'];
};

const normaliseMessProfile = (data: MessProfileDetails): MessProfileDetails => {
  const location = data?.location || ({} as MessProfileDetails['location']);

  return {
    ...data,
    id: data._id || data.id || '',
    location: {
      street: location.street || '',
      city: location.city || '',
      district: location.district || '',
      state: location.state || '',
      pincode: location.pincode || '',
      country: location.country || 'India',
    },
    colleges: Array.isArray(data.colleges) ? data.colleges : [],
    ownerPhone: data.ownerPhone || '',
    ownerEmail: (data.ownerEmail || '').toLowerCase(),
    types: sanitiseMessTypes(data.types),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const mapPersonalFormFromUser = (user: UserProfileData): PersonalInfoForm => ({
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  address: user.address,
  gender: user.gender,
  dob: user.dateOfBirth,
  status: user.status,
});

const mapMessFormFromProfile = (
  mess: MessProfileDetails | null,
  fallbackEmail: string,
): MessFormState => {
  if (!mess) {
    return defaultMessForm(fallbackEmail);
  }

  return {
    name: mess.name || '',
    street: mess.location.street || '',
    city: mess.location.city || '',
    district: mess.location.district || '',
    state: mess.location.state || '',
    pincode: mess.location.pincode || '',
    country: mess.location.country || 'India',
    colleges: mess.colleges.join('\n'),
    ownerPhone: mess.ownerPhone || '',
    ownerEmail: mess.ownerEmail || fallbackEmail,
    types: sanitiseMessTypes(mess.types),
  };
};

const formatMessAddress = (mess?: MessProfileDetails | null): string => {
  if (!mess) return 'Not provided';
  const { location } = mess;
  const segments = [
    location.street,
    location.city,
    location.district,
    location.state,
    location.pincode,
    location.country,
  ]
    .map((segment) => segment?.trim())
    .filter(Boolean);
  return segments.length ? segments.join(', ') : 'Not provided';
};

const buildProfile = (
  user: UserProfileData,
  mess: MessProfileDetails | null,
  previous?: MessOwnerProfile | null,
): MessOwnerProfile => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  address: user.address,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  ...(user.avatar ? { avatar: user.avatar } : {}),
  status: user.status,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  messProfile: mess,
  ...(mess?.name ? { messName: mess.name } : {}),
  ...(mess ? { messAddress: formatMessAddress(mess) } : {}),
  ...(mess?.ownerEmail ? { ownerEmail: mess.ownerEmail } : {}),
  ...(mess?.ownerPhone ? { ownerPhone: mess.ownerPhone } : {}),
  ...(mess?.types ? { messTypes: mess.types } : {}),
  monthlyRevenue: previous?.monthlyRevenue ?? 0,
  totalUsers: previous?.totalUsers ?? 0,
  ...(previous?.rating !== undefined ? { rating: previous.rating } : {}),
  ...(previous?.totalReviews !== undefined ? { totalReviews: previous.totalReviews } : {}),
});

export const useMessOwnerProfile = () => {
  const { toast } = useToast();

  const [profile, setProfile] = useState<MessOwnerProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [messProfile, setMessProfile] = useState<MessProfileDetails | null>(null);
  const [personalForm, setPersonalForm] = useState<PersonalInfoForm>(defaultPersonalForm);
  const [messForm, setMessForm] = useState<MessFormState>(defaultMessForm());
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingMess, setIsSavingMess] = useState(false);
  const [hasMessProfile, setHasMessProfile] = useState(false);
  const [platformCharges, setPlatformCharges] = useState<PlatformCharge[]>([]);
  const [isLoadingPlatformCharges, setIsLoadingPlatformCharges] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use API client services instead of direct fetch
      const userResponse = await userService.getProfile();
      if (!userResponse.success || !userResponse.data) {
        throw new Error(userResponse.message || 'Failed to fetch profile');
      }

      const userPayload: UserProfileApiResponse = {
        success: userResponse.success,
        message: userResponse.message,
        data: userResponse.data
      };
      const normalisedUser = normaliseUserProfile(userPayload.data);

      let fetchedMess: MessProfileDetails | null = null;
      let messExists = false;

      try {
        const messResponse = await messAPI.getProfile();
        if (messResponse.data?.success && messResponse.data?.data) {
          const messPayload: MessProfileApiResponse = {
            success: messResponse.data.success,
            message: messResponse.data.message,
            data: messResponse.data.data
          };
          fetchedMess = normaliseMessProfile(messPayload.data);
          messExists = true;
        } else if (messResponse.status === 404 || (messResponse.data && !messResponse.data.success)) {
          messExists = false;
        } else {
          throw new Error(messResponse.data?.message || 'Failed to fetch mess profile');
        }
      } catch (error: any) {
        if (error.response?.status === 404 || (error instanceof Error && error.message.includes('No mess profile'))) {
          messExists = false;
        } else if (error) {
          console.warn('Mess profile fetch warning:', error);
        }
      }

      setUserProfile(normalisedUser);
      setMessProfile(fetchedMess);
      setHasMessProfile(messExists);
      setPersonalForm(mapPersonalFormFromUser(normalisedUser));
      setMessForm(mapMessFormFromProfile(fetchedMess, normalisedUser.email));
      setProfile((previous) => buildProfile(normalisedUser, fetchedMess, previous));
    } catch (error) {
      console.error('Error fetching mess owner profile:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchPlatformCharges = useCallback(async () => {
    try {
      setIsLoadingPlatformCharges(true);
      
      // Use API client instead of raw fetch
      const response = await apiClient.get('/mess-owner/platform-charges');
      
      if (response.data.success && response.data.data) {
        setPlatformCharges(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Authentication error fetching platform charges.');
        setPlatformCharges([]);
      } else if (error.response?.status === 404) {
        // Endpoint might not exist yet, set empty array
        console.warn('Platform charges endpoint not found (404).');
        setPlatformCharges([]);
      } else {
        console.error('Error fetching platform charges:', error);
        toast({
          title: 'Error',
          description: 'Failed to load platform charges',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoadingPlatformCharges(false);
    }
  }, [toast]);

  const savePersonalInfo = useCallback(
    async (formData: PersonalInfoForm) => {
      if (!userProfile) {
        toast({
          title: 'Error',
          description: 'User profile is not loaded yet',
          variant: 'destructive',
        });
        return false;
      }

      const validation = validatePersonalInfo(formData);
      if (!validation.isValid) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join(', '),
          variant: 'destructive',
        });
        return false;
      }

      try {
        setIsSavingPersonal(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          gender: formData.gender,
          dob: formData.dob,
          status: formData.status,
        };

        // Use API client instead of raw fetch
        const response = await apiClient.put('/user/profile', payload);
        const data: UserProfileApiResponse = response.data;
        const updatedUser = normaliseUserProfile(data.data);

        setUserProfile(updatedUser);
        setPersonalForm(mapPersonalFormFromUser(updatedUser));
        setProfile((previous) => buildProfile(updatedUser, messProfile, previous));

        toast({
          title: 'Success',
          description: 'Personal information updated successfully',
        });
        return true;
      } catch (error) {
        console.error('Error updating personal information:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to update profile',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSavingPersonal(false);
      }
    },
    [toast, messProfile, userProfile],
  );

  const saveMessProfile = useCallback(
    async (formData: MessFormState) => {
      if (!userProfile) {
        toast({
          title: 'Error',
          description: 'User profile is not loaded yet',
          variant: 'destructive',
        });
        return false;
      }

      const validation = validateMessProfileForm(formData);
      if (!validation.isValid) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join(', '),
          variant: 'destructive',
        });
        return false;
      }

      try {
        setIsSavingMess(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const payload = {
          name: formData.name.trim(),
          location: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            district: formData.district.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            country: formData.country.trim() || 'India',
          },
          colleges: parseCollegesInput(formData.colleges),
          ownerPhone: formData.ownerPhone.trim(),
          ownerEmail: formData.ownerEmail.trim().toLowerCase(),
          types: sanitiseMessTypes(formData.types),
        };

        // Use API client instead of raw fetch
        const response = hasMessProfile
          ? await apiClient.put('/mess/profile', payload)
          : await apiClient.post('/mess/profile', payload);
        const data: MessProfileApiResponse = response.data;
        const updatedMess = normaliseMessProfile(data.data);

        setMessProfile(updatedMess);
        setHasMessProfile(true);
        setMessForm(mapMessFormFromProfile(updatedMess, userProfile.email));
        setProfile((previous) => buildProfile(userProfile, updatedMess, previous));

        toast({
          title: 'Success',
          description: hasMessProfile
            ? 'Mess profile updated successfully'
            : 'Mess profile created successfully',
        });
        return true;
      } catch (error) {
        console.error('Error updating mess profile:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to update mess profile',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSavingMess(false);
      }
    },
    [toast, hasMessProfile, userProfile],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const formData = new FormData();
        formData.append('avatar', file);

        // Use API client instead of raw fetch
        const response = await apiClient.post('/user/profile/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Axios automatically throws on non-2xx status, so if we get here, it's successful
        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Failed to upload avatar');
        }

        // Axios response data is already parsed
        const avatarUrl: string | undefined = response.data?.data?.avatar;

        if (avatarUrl) {
          setUserProfile((prev) => (prev ? { ...prev, avatar: avatarUrl } : prev));
          setProfile((prev) => (prev ? { ...prev, avatar: avatarUrl } : prev));
          toast({
            title: 'Success',
            description: 'Profile picture updated successfully',
          });
          return true;
        }

        throw new Error(response.data?.message || 'Failed to upload profile picture');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to upload profile picture',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast],
  );

  const resetPersonalForm = useCallback(() => {
    if (userProfile) {
      setPersonalForm(mapPersonalFormFromUser(userProfile));
    } else {
      setPersonalForm(defaultPersonalForm);
    }
  }, [userProfile]);

  const resetMessForm = useCallback(() => {
    if (messProfile && userProfile) {
      setMessForm(mapMessFormFromProfile(messProfile, userProfile.email));
    } else if (userProfile) {
      setMessForm(defaultMessForm(userProfile.email));
    } else {
      setMessForm(defaultMessForm());
    }
  }, [messProfile, userProfile]);

  useEffect(() => {
    fetchProfile();
    fetchPlatformCharges();
  }, [fetchProfile, fetchPlatformCharges]);

  return {
    profile,
    isLoading,
    personalForm,
    setPersonalForm,
    messForm,
    setMessForm,
    savePersonalInfo,
    saveMessProfile,
    resetPersonalForm,
    resetMessForm,
    isSavingPersonal,
    isSavingMess,
    hasMessProfile,
    platformCharges,
    isLoadingPlatformCharges,
    fetchProfile,
    fetchPlatformCharges,
    uploadAvatar,
  };
};






