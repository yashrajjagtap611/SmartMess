import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { uploadMessPhoto, getMessPhoto, updateMessPhoto, deleteMessPhoto } from '../services/messPhotoService';
import { getMessProfile, saveMessProfile } from '../services/messProfileService';
import type { MessProfile as MessProfileType } from '../services/messProfileService';
import { STORAGE_KEYS, storageUtils } from '../utils/storageUtils';

interface MessLocation {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface MessProfile {
  _id?: string;
  name: string;
  location: MessLocation;
  colleges: string[];
  collegeInput: string;
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  logo: string | null;
}

interface MessProfileContextType {
  messProfile: MessProfile;
  setMessProfile: React.Dispatch<React.SetStateAction<MessProfile>>;
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string;
  hasUnsavedChanges: boolean;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDeletePhoto: () => Promise<void>;
  loadExistingPhoto: () => Promise<void>;
  updateMessProfile: (updates: Partial<MessProfile>) => void;
  preloadImage: (url: string) => Promise<void>;
  saveMessProfile: () => Promise<void>;
  loadMessProfile: () => Promise<void>;
  isInitialized: boolean;
}

const MessProfileContext = createContext<MessProfileContextType | undefined>(undefined);

// Global cache for images
const imageCache = new Map<string, string>();

// Helper function to load data from localStorage
const loadFromStorage = (): MessProfile => {
  try {
    const savedProfile = localStorage.getItem(STORAGE_KEYS.MESS_PROFILE);
    const savedColleges = localStorage.getItem(STORAGE_KEYS.MESS_COLLEGES);
    const savedLocation = localStorage.getItem(STORAGE_KEYS.MESS_LOCATION);
    const savedOwnerPhone = localStorage.getItem(STORAGE_KEYS.MESS_OWNER_PHONE);
    const savedOwnerEmail = localStorage.getItem(STORAGE_KEYS.MESS_OWNER_EMAIL);
    const savedTypes = localStorage.getItem(STORAGE_KEYS.MESS_TYPES);
    
    // Get current user's email to ensure consistency
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const currentUserEmail = currentUser.email || '';
    
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      return {
        ...parsed,
        colleges: savedColleges ? JSON.parse(savedColleges) : [],
        location: savedLocation ? JSON.parse(savedLocation) : {
          street: "",
          city: "",
          district: "",
          state: "",
          pincode: "",
          country: "India",
          latitude: undefined,
          longitude: undefined
        },
        ownerPhone: savedOwnerPhone || "",
        ownerEmail: currentUserEmail || savedOwnerEmail || "", // Use current user's email
        types: savedTypes ? JSON.parse(savedTypes) : [],
        collegeInput: ""
      };
    }
  } catch (error) {
    console.warn('Failed to load saved mess profile from localStorage:', error);
  }
  
  // Get current user's email for default values
  const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserEmail = currentUser.email || '';
  
  // Default values
  return {
    name: "Your Mess",
    location: {
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      country: "India"
    },
    colleges: [],
    collegeInput: "",
    ownerPhone: "",
    ownerEmail: currentUserEmail, // Use current user's email
    types: [],
    logo: null
  };
};

// Helper function to save data to localStorage
const saveToStorage = (profile: MessProfile) => {
  try {
    const data = {
      MESS_PROFILE: profile,
      MESS_COLLEGES: profile.colleges,
      MESS_LOCATION: profile.location,
      MESS_OWNER_PHONE: profile.ownerPhone,
      MESS_OWNER_EMAIL: profile.ownerEmail,
      MESS_TYPES: profile.types
    };
    storageUtils.saveMessProfileData(STORAGE_KEYS.MESS_PROFILE, data);
    console.log('Data saved to localStorage:', profile);
  } catch (error) {
    console.warn('Failed to save mess profile to localStorage:', error);
  }
};

export const useMessProfile = () => {
  const context = useContext(MessProfileContext);
  if (context === undefined) {
    console.error('useMessProfile called outside of MessProfileProvider');
    throw new Error('useMessProfile must be used within a MessProfileProvider');
  }
  return context;
};

interface MessProfileProviderProps {
  children: ReactNode;
}

export const MessProfileProvider: React.FC<MessProfileProviderProps> = ({ children }) => {
  const [messProfile, setMessProfile] = useState<MessProfile>(loadFromStorage);
  const [photo, setPhoto] = useState<string | null>(() => {
    const savedPhoto = localStorage.getItem(STORAGE_KEYS.MESS_PHOTO);
    return savedPhoto || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const hasLoadedPhoto = useRef(false);
  const hasLoadedProfile = useRef(false);
  const lastSaveTime = useRef<number>(0);
  const initialProfileRef = useRef<MessProfile | null>(null);

  // Preload image function
  const preloadImage = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.set(url, url);
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${url}`));
      };
      img.src = url;
    });
  };

  // Load mess profile from backend
  const loadMessProfile = async (forceReload: boolean = false): Promise<void> => {
    if (hasLoadedProfile.current && !forceReload) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading mess profile from backend...');
      const backendProfile = await getMessProfile();
      
      console.log('Backend profile received:', backendProfile);
      
      // Get current user's email from localStorage
      const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const currentUserEmail = currentUser.email || '';
      
      console.log('Current user email:', currentUserEmail);
      console.log('Backend profile owner email:', backendProfile.ownerEmail);
      
      // Create a completely new profile object from backend data
      const updatedProfile: MessProfile = {
        ...(backendProfile._id && { _id: backendProfile._id }),
        name: backendProfile.name || "Your Mess",
        location: {
          street: backendProfile.location?.street || "",
          city: backendProfile.location?.city || "",
          district: backendProfile.location?.district || "",
          state: backendProfile.location?.state || "",
          pincode: backendProfile.location?.pincode || "",
          country: backendProfile.location?.country || "India",
          ...(backendProfile.location?.latitude !== undefined ? { latitude: backendProfile.location.latitude } : {}),
          ...(backendProfile.location?.longitude !== undefined ? { longitude: backendProfile.location.longitude } : {})
        },
        colleges: Array.isArray(backendProfile.colleges) ? backendProfile.colleges : [],
        ownerPhone: backendProfile.ownerPhone || "",
        // Ensure owner email matches current user's email
        ownerEmail: currentUserEmail || backendProfile.ownerEmail || "",
        types: Array.isArray(backendProfile.types) ? backendProfile.types : [],
        logo: backendProfile.logo || null,
        collegeInput: "" // Reset college input
      };
      
      // If there was a mismatch, log it for debugging
      if (backendProfile.ownerEmail && backendProfile.ownerEmail !== currentUserEmail) {
        console.warn('Owner email mismatch detected:', {
          backendEmail: backendProfile.ownerEmail,
          currentUserEmail: currentUserEmail
        });
      }
      
      console.log('Setting updated profile:', updatedProfile);
      setMessProfile(updatedProfile);
      
      // Set initial profile reference for change detection
      initialProfileRef.current = updatedProfile;
      setHasUnsavedChanges(false);
      
      if (backendProfile.logo) {
        setPhoto(backendProfile.logo);
        localStorage.setItem(STORAGE_KEYS.MESS_PHOTO, backendProfile.logo);
      }
      
      // Save to localStorage as backup
      saveToStorage(updatedProfile);
      
      hasLoadedProfile.current = true;
      console.log('Mess profile loaded successfully from backend');
    } catch (err: any) {
      console.error('Failed to load mess profile from backend:', err);
      // Don't set error for backend failures, use localStorage as fallback
      console.log('Using localStorage data as fallback');
      
      // If it's a 404 (no profile found), that's expected for new users
      if (err.message && err.message.includes('404')) {
        console.log('No profile found (expected for new users)');
      } else {
        // Try to load from localStorage as fallback
        try {
          const fallbackProfile = loadFromStorage();
          console.log('Loading fallback profile from localStorage:', fallbackProfile);
          setMessProfile(fallbackProfile);
          
          // Set initial profile reference for change detection
          initialProfileRef.current = fallbackProfile;
          setHasUnsavedChanges(false);
        } catch (fallbackError) {
          console.error('Failed to load fallback profile:', fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Save mess profile to backend
  const saveMessProfileToBackend = async (): Promise<void> => {
    if (isSaving) return; // Prevent concurrent saves
    
    setIsSaving(true);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Saving mess profile to backend...', messProfile);
      
      // Get current user's email to ensure consistency
      const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const currentUserEmail = currentUser.email || '';
      
      // Convert to backend format, ensuring owner email matches current user
      const backendProfile: MessProfileType = {
        name: messProfile.name,
        location: messProfile.location,
        colleges: messProfile.colleges,
        ownerPhone: messProfile.ownerPhone,
        ownerEmail: currentUserEmail, // Always use current user's email
        types: messProfile.types,
        logo: messProfile.logo
      };
      
      console.log('Saving with owner email:', currentUserEmail);
      
      // Save to backend
      await saveMessProfile(backendProfile);
      
      // Update local state to reflect the saved email
      const updatedLocalProfile = {
        ...messProfile,
        ownerEmail: currentUserEmail
      };
      setMessProfile(updatedLocalProfile);
      
      // Save to localStorage as backup
      saveToStorage(updatedLocalProfile);
      
      // Don't reload after save to prevent infinite loops
      // The saved data is already in the state
      console.log('Mess profile saved successfully to backend');
      lastSaveTime.current = Date.now();
      
      // Reset unsaved changes flag after successful save
      setHasUnsavedChanges(false);
      initialProfileRef.current = updatedLocalProfile;
    } catch (err: any) {
      console.error('Failed to save mess profile to backend:', err);
      setError(err.message || 'Failed to save mess profile');
      // Still save to localStorage as backup
      saveToStorage(messProfile);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  // Sync owner email with current user's email
  const syncOwnerEmail = () => {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const currentUserEmail = currentUser.email || '';
    
    if (currentUserEmail && messProfile.ownerEmail !== currentUserEmail) {
      console.log('Syncing owner email with current user email:', {
        oldEmail: messProfile.ownerEmail,
        newEmail: currentUserEmail
      });
      
      updateMessProfile({ ownerEmail: currentUserEmail });
    }
  };

  // Listen for user info changes and sync owner email
  useEffect(() => {
    const handleUserInfoChange = (e: StorageEvent) => {
      if (e.key === 'userInfo' && isInitialized && e.newValue !== e.oldValue) {
        console.log('User info changed, syncing owner email...');
        syncOwnerEmail();
      }
    };

    window.addEventListener('storage', handleUserInfoChange);
    return () => window.removeEventListener('storage', handleUserInfoChange);
  }, [isInitialized]);

  // Initialize data on component mount - ONLY for mess-owners
  useEffect(() => {
    // Reset flags on mount
    hasLoadedProfile.current = false;
    hasLoadedPhoto.current = false;
    
    const initializeData = async () => {
      console.log('Initializing MessProfileContext...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, skipping initialization');
        setIsInitialized(true);
        return;
      }
      
      // Check user role - only load mess profile for mess-owners
      const userRole = localStorage.getItem('userRole');
      const userInfo = localStorage.getItem('userInfo');
      
      let isMessOwner = false;
      if (userRole === 'mess-owner') {
        isMessOwner = true;
      } else if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          isMessOwner = user.role === 'mess-owner';
        } catch (e) {
          // Invalid JSON, skip
        }
      }
      
      // Only initialize mess profile for mess-owners
      if (!isMessOwner) {
        console.log('User is not a mess-owner, skipping mess profile initialization');
        setIsInitialized(true);
        return;
      }
      
      console.log('User is mess-owner, loading mess profile...');
      
      // Load photo first
      if (!hasLoadedPhoto.current) {
        await loadExistingPhoto();
        hasLoadedPhoto.current = true;
      }
      
      // Then load profile
      await loadMessProfile();
      
      // Sync owner email after loading
      syncOwnerEmail();
      
      setIsInitialized(true);
      console.log('MessProfileContext initialized successfully');
    };

    initializeData();
    
    // Cleanup function to reset flags on unmount
    return () => {
      hasLoadedProfile.current = false;
      hasLoadedPhoto.current = false;
    };
  }, []);

  // Auto-save functionality with validation - only when there are unsaved changes
  useEffect(() => {
    if (!isInitialized || isSaving || !hasUnsavedChanges) return; // Skip if saving manually or no changes

    const autoSaveTimer = setTimeout(async () => {
      try {
        // Validate data before auto-saving
        // const validation = validateMessProfile(messProfile); // Removed unused validation
        // if (!validation.isValid) {
        //   console.log('Auto-save skipped: Validation failed', validation.errors);
        //   return;
        // }

        // Only auto-save if we have meaningful data
        if (messProfile.name.trim().length < 2) {
          console.log('Auto-save skipped: Mess name too short');
          return;
        }

        if (messProfile.colleges.length === 0) {
          console.log('Auto-save skipped: No colleges added');
          return;
        }

        if (messProfile.types.length === 0) {
          console.log('Auto-save skipped: No mess types selected');
          return;
        }

        if (!messProfile.location.city || !messProfile.location.state || !messProfile.location.pincode) {
          console.log('Auto-save skipped: Incomplete location data');
          return;
        }

        if (!messProfile.ownerEmail) {
          console.log('Auto-save skipped: No owner email');
          return;
        }

        // Prevent excessive saves - only save if more than 10 seconds have passed since last save
        const now = Date.now();
        if (now - lastSaveTime.current < 10000) {
          console.log('Auto-save skipped: Too soon since last save');
          return;
        }
        
        console.log('Auto-saving mess profile due to unsaved changes...');
        await saveMessProfileToBackend();
        lastSaveTime.current = now;
        
        // Reset unsaved changes flag after successful save
        setHasUnsavedChanges(false);
        initialProfileRef.current = messProfile;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 3000); // Auto-save after 3 seconds of changes

    return () => clearTimeout(autoSaveTimer);
  }, [messProfile, isInitialized, isSaving, hasUnsavedChanges]);

  // Save profile to localStorage whenever it changes (with debounce)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Debounce localStorage saves to prevent excessive writes
    const saveTimer = setTimeout(() => {
      saveToStorage(messProfile);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(saveTimer);
  }, [messProfile, isInitialized]);

  const loadExistingPhoto = async () => {
    console.log('Loading existing photo...');
    setLoading(true);
    setError(null);
    
    try {
      // Check if we already have a cached photo
      const cachedPhoto = localStorage.getItem(STORAGE_KEYS.MESS_PHOTO);
      if (cachedPhoto && imageCache.has(cachedPhoto)) {
        console.log('Using cached photo:', cachedPhoto);
        // Only update if the logo is different to prevent unnecessary re-renders
        if (messProfile.logo !== cachedPhoto) {
          setPhoto(cachedPhoto);
          setMessProfile(prev => ({ ...prev, logo: cachedPhoto }));
        }
        setLoading(false);
        return;
      }

      const url = await getMessPhoto();
      console.log('Photo URL received:', url);
      
      if (url) {
        // Cache the photo URL
        localStorage.setItem(STORAGE_KEYS.MESS_PHOTO, url);
        imageCache.set(url, url);
        
        // Preload the image for instant display
        try {
          await preloadImage(url);
          console.log('Image preloaded successfully');
        } catch (preloadError) {
          console.warn('Failed to preload image, but continuing:', preloadError);
        }
        
        // Only update if the logo is different to prevent unnecessary re-renders
        if (messProfile.logo !== url) {
          setPhoto(url);
          setMessProfile(prev => ({ ...prev, logo: url }));
          console.log('Photo set successfully:', url);
        }
      } else {
        console.log('No photo URL received, setting photo to null');
        // Only update if the logo is not already null
        if (messProfile.logo !== null) {
          setPhoto(null);
          setMessProfile(prev => ({ ...prev, logo: null }));
        }
        localStorage.removeItem(STORAGE_KEYS.MESS_PHOTO);
      }
    } catch (err: any) {
      console.error('Failed to load photo:', err);
      setError(err.message || 'Failed to load photo');
      // Clear cached URL if it's invalid
      localStorage.removeItem(STORAGE_KEYS.MESS_PHOTO);
    } finally {
      setLoading(false);
      console.log('Photo loading completed');
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress('Uploading...');

    try {
      let url: string;
      
      if (photo) {
        setUploadProgress('Updating photo...');
        url = await updateMessPhoto(file);
        console.log('Photo updated successfully:', url);
      } else {
        setUploadProgress('Uploading photo...');
        url = await uploadMessPhoto(file);
        console.log('Photo uploaded successfully:', url);
      }
      
      // Cache the new photo URL
      localStorage.setItem(STORAGE_KEYS.MESS_PHOTO, url);
      imageCache.set(url, url);
      
      // Preload the new image
      try {
        await preloadImage(url);
        console.log('New image preloaded successfully');
      } catch (preloadError) {
        console.warn('Failed to preload new image, but continuing:', preloadError);
      }
      
      setPhoto(url);
      setMessProfile(prev => ({ ...prev, logo: url }));
      setUploadProgress('Success!');
      
      // Clear the file input
      if (e.target) {
        e.target.value = '';
      }
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
      
    } catch (err: any) {
      console.error('Photo operation failed:', err);
      setError(err.message || 'Failed to process photo');
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!photo) return;
    
    setLoading(true);
    setError(null);
    setUploadProgress('Deleting...');

    try {
      await deleteMessPhoto();
      
      // Clear cache and localStorage
      imageCache.delete(photo);
      localStorage.removeItem(STORAGE_KEYS.MESS_PHOTO);
      
      setPhoto(null);
      setMessProfile(prev => ({ ...prev, logo: null }));
      setUploadProgress('Deleted successfully!');
      console.log('Photo deleted successfully');
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
      
    } catch (err: any) {
      console.error('Failed to delete photo:', err);
      setError(err.message || 'Failed to delete photo');
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const updateMessProfile = (updates: Partial<MessProfile>) => {
    setMessProfile(prev => {
      const updated = { ...prev, ...updates };
      
      // Check if there are actual changes compared to initial profile
      if (initialProfileRef.current) {
        const hasChanges = JSON.stringify(updated) !== JSON.stringify(initialProfileRef.current);
        setHasUnsavedChanges(hasChanges);
        console.log('Profile updated, has unsaved changes:', hasChanges);
      }
      
      return updated;
    });
  };

  const value: MessProfileContextType = {
    messProfile,
    setMessProfile,
    photo,
    loading,
    error,
    uploadProgress,
    hasUnsavedChanges,
    handlePhotoChange,
    handleDeletePhoto,
    loadExistingPhoto,
    updateMessProfile,
    preloadImage,
    saveMessProfile: saveMessProfileToBackend,
    loadMessProfile,
    isInitialized
  };

  return (
    <MessProfileContext.Provider value={value}>
      {children}
    </MessProfileContext.Provider>
  );
};