import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../components/theme/theme-provider';
import { handleLogout as logoutUtil } from '../../../../../utils/logout';
import { useMessProfile } from '../../../../../contexts/MessProfileContext';
import type { MessProfileProps } from './MessProfile.types';
import { validateMessProfile, getMessProfileErrorMessage } from './MessProfile.utils';
import { useToast } from '../../../../../hooks/use-toast';

export const useMessProfileScreen = (_props?: MessProfileProps) => {
  const navigate = useNavigate();
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use context for mess profile data
  const { 
    messProfile, 
    photo, 
    loading, 
    error, 
    uploadProgress, 
    isInitialized,
    updateMessProfile,
    saveMessProfile,
    handlePhotoChange
  } = useMessProfile();

  // Local state for form handling
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();

  // Form handlers
  const handleMessProfileChange = (field: string, value: any) => {
    setValidationErrors([]);
    updateMessProfile({ [field]: value });
  };

  const handleLocationChange = (field: string, value: string) => {
    setValidationErrors([]);
    updateMessProfile({ 
      location: { ...messProfile.location, [field]: value } 
    });
  };

  const handleAddCollege = () => {
    if (messProfile.collegeInput && messProfile.collegeInput.trim()) {
      const newCollege = messProfile.collegeInput.trim();
      
      if (messProfile.colleges.includes(newCollege)) {
        setValidationErrors(['This college is already added']);
        return;
      }
      
      const newColleges = [...messProfile.colleges, newCollege];
      updateMessProfile({ 
        colleges: newColleges,
        collegeInput: ""
      });
      setValidationErrors([]);
    }
  };

  const handleRemoveCollege = (idx: number) => {
    const newColleges = messProfile.colleges.filter((_: string, i: number) => i !== idx);
    updateMessProfile({ colleges: newColleges });
    setValidationErrors([]);
  };

  const handleMessTypeToggle = (type: string) => {
    setValidationErrors([]);
    const newTypes = messProfile.types.includes(type)
      ? messProfile.types.filter((t: string) => t !== type)
      : [...messProfile.types, type];
    updateMessProfile({ types: newTypes });
  };

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhotoChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validation = validateMessProfile(messProfile);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSaveStatus('error');
      setSaveMessage('Please fix the validation errors before saving.');
      return;
    }

    setSaveStatus('saving');
    setSaveMessage('Saving mess profile...');
    
    try {
      await saveMessProfile();
      
      setSaveStatus('success');
      setSaveMessage('Mess profile saved successfully!');
      
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save mess profile:', error);
      setSaveStatus('error');
      setSaveMessage(getMessProfileErrorMessage(error));
    }
  };

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  // Get current location and auto-fill address
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setValidationErrors([]);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      // Get current position with better error handling
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (error: GeolocationPositionError) => {
              // Handle different geolocation error codes
              // Error codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
              let errorMessage = "Failed to get your location.";
              
              switch (error.code) {
                case 1: // PERMISSION_DENIED
                  errorMessage = "Location permission was denied. Please enable location access in your browser settings and try again.";
                  break;
                case 2: // POSITION_UNAVAILABLE
                  errorMessage = "Location information is unavailable. Please check your device's location settings.";
                  break;
                case 3: // TIMEOUT
                  errorMessage = "Location request timed out. Please try again.";
                  break;
                default:
                  // Check error message for common patterns
                  const msg = error.message?.toLowerCase() || "";
                  if (msg.includes("denied") || msg.includes("permission")) {
                    errorMessage = "Location permission was denied. Please enable location access in your browser settings and try again.";
                  } else if (msg.includes("timeout")) {
                    errorMessage = "Location request timed out. Please try again.";
                  } else if (msg.includes("unavailable")) {
                    errorMessage = "Location information is unavailable. Please check your device's location settings.";
                  } else {
                    errorMessage = error.message || "Unable to get your location. Please try again.";
                  }
              }
              
              reject(new Error(errorMessage));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        }
      );

      const { latitude, longitude } = position.coords;

      // Get address from coordinates using backend proxy
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/user/profile/geocode?lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch address");
      }

      const responseData = await response.json();
      const data = responseData.data;
      const address = data.address || {};

      // Parse address fields (similar to user profile implementation)
      let street =
        address.road ||
        address.street ||
        address.pedestrian ||
        address.path ||
        address.footway ||
        address.residential ||
        address.house_number ||
        "";

      if (address.house_number && street && street !== address.house_number) {
        street = `${address.house_number} ${street}`.trim();
      }

      // City/Town/Village
      let city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "";

      // District
      let district = "";
      if (address.district) {
        district = address.district.replace(/\s+district$/i, "").trim();
      } else if (address.city_district && address.city_district !== city) {
        district = address.city_district.replace(/\s+district$/i, "").trim();
      }

      // Filter out district-like values from city
      if (city && (city.toLowerCase().includes("district") || city === district)) {
        city = "";
      }

      // Try suburb or neighbourhood if city is still empty
      if (!city) {
        const suburb = address.suburb || address.neighbourhood || "";
        if (suburb && !suburb.toLowerCase().includes("district") && suburb !== district) {
          city = suburb;
        }
      }

      // State
      const state =
        address.state ||
        address.region ||
        address.province ||
        address.state_district ||
        "";

      // Pincode
      const pincode = address.postcode || "";

      // Country
      const country = address.country || "India";

      // Update location with all fields including coordinates
      updateMessProfile({
        location: {
          street: street || messProfile.location.street,
          city: city || messProfile.location.city,
          district: district || messProfile.location.district,
          state: state || messProfile.location.state,
          pincode: pincode || messProfile.location.pincode,
          country: country || messProfile.location.country,
          latitude: latitude,
          longitude: longitude,
        },
      });

      toast({
        title: "Location Updated",
        description: "Address fields have been auto-filled from your current location.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Failed to get current location:", error);
      
      // Extract error message and normalize it
      let errorMessage = error.message || "Failed to get current location. Please try again.";
      const errorMsgLower = errorMessage.toLowerCase();
      
      // Provide more helpful messages for common errors
      if (errorMsgLower.includes("permission") || errorMsgLower.includes("denied") || errorMsgLower.includes("user denied")) {
        errorMessage = "Location access was denied. Please enable location permissions in your browser settings and try again.";
      } else if (errorMsgLower.includes("timeout")) {
        errorMessage = "Location request timed out. Please check your internet connection and try again.";
      } else if (errorMsgLower.includes("unavailable") || errorMsgLower.includes("not available")) {
        errorMessage = "Location services are unavailable. Please check your device settings and try again.";
      } else if (errorMsgLower.includes("not supported")) {
        errorMessage = "Geolocation is not supported by your browser. Please use a modern browser with location support.";
      }
      
      setValidationErrors([errorMessage]);
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return {
    // State
    messProfile,
    photo,
    loading,
    error,
    uploadProgress,
    validationErrors,
    saveStatus,
    saveMessage,
    isInitialized,
    isDarkMode,
    
    // Refs
    fileInputRef,
    
    // Handlers
    handleMessProfileChange,
    handleLocationChange,
    handleAddCollege,
    handleRemoveCollege,
    handleMessTypeToggle,
    handleLogoClick,
    handleLogoChange,
    handleSubmit,
    handleLogout,
    toggleDarkMode,
    getCurrentLocation,
    isLoadingLocation,
  };
};
