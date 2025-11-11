import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  UserProfile,
  ProfileFormData,
  ProfileActivity,
} from "./Profile.types";
import { CommonHeader } from "@/components/common/Header";
import { 
  MobileProfileNav, 
  USER_PROFILE_SECTIONS,
} from "@/components/common/MobileProfileNav";
import {
  ProfileHeroCard,
  PersonalInfoSection,
  AddressSection,
  StudentInfoSection,
  ProfessionInfoSection,
  ActivitiesSection,
  SubscriptionsSection,
} from "./components";
import userService from "@/services/api/userService";

const Profile: React.FC = () => {
  // Debug logging removed - uncomment only when needed for debugging
  // console.log("Profile component: Rendering");
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingStudentInfo, setIsEditingStudentInfo] = useState(false);
  const [isEditingProfessionInfo, setIsEditingProfessionInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [editForm, setEditForm] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: undefined as 'male' | 'female' | 'other' | undefined,
    address: "",
    currentAddress: {
      street: "",
      city: "",
      district: "",
      taluka: "",
      state: "",
      pincode: "",
      country: "India",
    },
    college: "",
    course: "",
    isStudent: true, // Default to student
    studentInfo: {
      college: "",
      course: "",
      year: "",
      branch: "",
      collegeEmailId: "",
      educationCategory: "college",
      schoolClass: "",
      schoolStream: "",
      competitiveExam: "",
      academyName: "",
    },
    isWorking: false,
    professionInfo: {
      company: "",
      designation: "",
      department: "",
      workExperience: 0,
      workLocation: "",
      employeeId: "",
      joiningDate: "",
    },
  });
  const [activeSection, setActiveSection] = useState<string>("information");

  // Helper function to map profile data to form data
  const mapProfileToForm = (profileData: UserProfile): ProfileFormData => {
    const isStudent = profileData.isStudent ?? (profileData.isWorking !== true);
    const isWorking = profileData.isWorking || false;
    
    return {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone || "",
      dateOfBirth: profileData.dateOfBirth || "",
      gender: profileData.gender || undefined,
      address: profileData.address || "",
      currentAddress: {
        street: (profileData.currentAddress as any)?.street || "",
        city: (profileData.currentAddress as any)?.city || "",
        district: (profileData.currentAddress as any)?.district || "",
        taluka: (profileData.currentAddress as any)?.taluka || "",
        state: (profileData.currentAddress as any)?.state || "",
        pincode: (profileData.currentAddress as any)?.pincode || "",
        country: (profileData.currentAddress as any)?.country || "India",
        latitude: (profileData.currentAddress as any)?.latitude,
        longitude: (profileData.currentAddress as any)?.longitude,
      },
      college: profileData.college || profileData.studentInfo?.college || "",
      course: profileData.course || profileData.studentInfo?.course || "",
      isStudent,
      studentInfo: {
        college: profileData.studentInfo?.college || profileData.college || "",
        course: profileData.studentInfo?.course || profileData.course || "",
        year: profileData.studentInfo?.year || "",
        branch: profileData.studentInfo?.branch || "",
        collegeEmailId: profileData.studentInfo?.collegeEmailId || "",
        educationCategory: profileData.studentInfo?.educationCategory || "college",
        schoolClass: profileData.studentInfo?.schoolClass || "",
        schoolStream: profileData.studentInfo?.schoolStream || "",
        competitiveExam: profileData.studentInfo?.competitiveExam || "",
        academyName: profileData.studentInfo?.academyName || "",
      },
      isWorking,
      professionInfo: {
        company: profileData.professionInfo?.company || "",
        designation: profileData.professionInfo?.designation || "",
        department: profileData.professionInfo?.department || "",
        workExperience: profileData.professionInfo?.workExperience || 0,
        workLocation: profileData.professionInfo?.workLocation || "",
        employeeId: profileData.professionInfo?.employeeId || "",
        joiningDate: profileData.professionInfo?.joiningDate || "",
      },
    };
  };

  // Helper function for API updates
  const updateProfileSection = async (
    data: Record<string, any>,
    sectionName: string,
    setEditingState: (value: boolean) => void
  ) => {
    try {
      // Use userService instead of raw fetch
      const result = await userService.updateProfile(data);
      
      if (result.success && result.data) {
        // Map API response to component's UserProfile type
        const apiData = result.data as any;
        const updatedProfile: UserProfile = {
          ...profile!,
          ...apiData,
          isEmailVerified: apiData.isVerified !== undefined ? apiData.isVerified : (profile?.isEmailVerified || false),
          isPhoneVerified: apiData.isPhoneVerified !== undefined ? apiData.isPhoneVerified : (profile?.isPhoneVerified || false),
          dateOfBirth: apiData.dob || apiData.dateOfBirth || profile?.dateOfBirth,
        };
        setProfile(updatedProfile);
        setEditingState(false);
        toast({
          title: "Success",
          description: `${sectionName} updated successfully`,
        });
      } else {
        throw new Error(result.message || `Failed to update ${sectionName}`);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to update ${sectionName}`,
        variant: "destructive",
      });
    }
  };

  // Debug active section changes
  const handleSectionChange = (sectionId: string) => {
    console.log(
      "Profile: Changing active section from",
      activeSection,
      "to",
      sectionId
    );
    setActiveSection(sectionId);
  };

  useEffect(() => {
    console.log("Profile component: useEffect triggered");
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const userInfo = localStorage.getItem("userInfo");

    console.log("Profile component: Auth token exists:", !!token);
    console.log("Profile component: User role:", userRole);
    console.log("Profile component: User info:", userInfo);
    
    if (!token) {
      console.log("Profile component: No auth token, setting loading to false");
      setIsLoading(false);
      return;
    }
    
    // For testing purposes, if no user info exists, create a mock user
    if (!userInfo && token) {
      console.log("Profile component: Creating mock user for testing");
      const mockUser = {
        id: "1",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role: "user",
      };
      localStorage.setItem("userInfo", JSON.stringify(mockUser));
      localStorage.setItem("userRole", "user");
    }

    console.log("Profile component: Starting data fetch");
    fetchProfile();
    fetchActivities();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      console.log(
        "Fetching user profile with token:",
        token ? "Token exists" : "No token"
      );

      const response = await userService.getProfile();
      console.log("Profile data received:", response);
      
      if (response.success && response.data) {
        const apiData = response.data as any;
        
        // Map API response to component's UserProfile type
        // Ensure at least one status is selected - default to student
        const isStudent =
          apiData.isStudent === true
            ? true
            : apiData.isWorking !== true
            ? true
            : false;
        const isWorking = apiData.isWorking || false;

        const updatedProfile: UserProfile = {
          id: apiData.id || '',
          firstName: apiData.firstName || '',
          lastName: apiData.lastName || '',
          email: apiData.email || '',
          phone: apiData.phone || '',
          role: apiData.role || 'user',
          avatar: apiData.avatar,
          dateOfBirth: apiData.dob || apiData.dateOfBirth,
          gender: apiData.gender,
          address: apiData.address,
          college: apiData.college,
          course: apiData.course,
          isEmailVerified: apiData.isVerified !== undefined ? apiData.isVerified : (apiData.isEmailVerified || false),
          isPhoneVerified: apiData.isPhoneVerified || false,
          createdAt: apiData.createdAt || new Date().toISOString(),
          updatedAt: apiData.updatedAt || new Date().toISOString(),
          isStudent,
          isWorking,
          studentInfo: apiData.studentInfo,
          professionInfo: apiData.professionInfo,
          messDetails: apiData.messDetails,
          currentAddress: apiData.currentAddress,
        };

        setProfile(updatedProfile);
        setEditForm(mapProfileToForm(updatedProfile));
      } else {
        console.error("Unexpected profile data structure:", response);
        throw new Error("Invalid profile data structure");
      }
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      
      // If it's an authentication error, handle gracefully
      if (error.response?.status === 401 || error.message?.includes('401')) {
        console.log(
          "Profile component: Authentication error"
        );
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      
      const response = await userService.getActivity();
      
      if (response.success && response.data) {
        const notifications = response.data.activities || [];
        // Map backend notifications to ProfileActivity if needed
        const mapped: ProfileActivity[] = notifications.map((n: any) => {
          // Determine type from notification data
          let activityType: 'payment' | 'leave' | 'join' | 'update' = 'update';
          if (n.type) {
            if (n.type.includes('payment')) activityType = 'payment';
            else if (n.type.includes('leave')) activityType = 'leave';
            else if (n.type.includes('join')) activityType = 'join';
          }
          
          return {
            id: n.id || n._id || String(Date.now()),
            type: activityType,
            title: n.title || n.type || "Activity",
            description: n.description || n.message || "",
            status: (n.status === 'success' || n.status === 'pending' || n.status === 'failed') 
              ? n.status 
              : (n.isRead ? "success" : "pending"),
            timestamp: n.date || n.createdAt || n.timestamp || new Date().toISOString(),
          };
        });
        setActivities(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch profile activities:", error);
      // Silently fail - activities are not critical
    }
  };

  // Get current location and address
  const getCurrentLocationAndAddress = async () => {
    setIsLoadingLocation(true);
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Get address from coordinates using backend proxy (avoids CORS issues)
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
      const data = responseData.data; // Extract data from backend response
      const address = data.address || {};
      const displayName = data.display_name || "";

      // Log raw data for debugging
      console.log("Raw geocoding data:", { address, displayName });

      // Street address with multiple fallbacks
      let street =
        address.road ||
        address.street ||
        address.pedestrian ||
        address.path ||
        address.footway ||
        address.residential ||
        address.house_number ||
        "";

      // If we have house number, prepend it to the street
      if (address.house_number && street && street !== address.house_number) {
        street = `${address.house_number} ${street}`.trim();
      }

      // IMPORTANT: In Indian addresses, OpenStreetMap often returns:
      // - address.county = Taluka/Tehsil (NOT district!)
      // - address.district = District (may contain "District" suffix)
      // - address.taluka/tehsil = Sometimes present, sometimes not
      // - address.city/town/village = Actual city name

      // Indian address hierarchy: Village/Town/City < Taluka < District < State
      // City/Town/Village (most specific location)
      // IMPORTANT: Don't use values that contain "District" for city
      let city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "";

      // District (administrative division - between taluka and state)
      // Check district field first, and clean "District" suffix if present
      let district = "";
      if (address.district) {
        // Remove "District" suffix if present (e.g., "Pune District" -> "Pune")
        district = address.district.replace(/\s+district$/i, "").trim();
      } else if (address.city_district && address.city_district !== city) {
        // Only use city_district if it's different from city
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

      // Taluka/Tehsil (administrative division - between city and district)
      // In India, county field is often the taluka/tehsil, NOT the district!
      let taluka = "";
      if (address.taluka) {
        taluka = address.taluka;
      } else if (address.tehsil) {
        taluka = address.tehsil;
      } else if (
        address.subdistrict &&
        address.subdistrict !== city &&
        address.subdistrict !== district
      ) {
        taluka = address.subdistrict;
      } else if (
        address.county &&
        address.county !== city &&
        address.county !== district
      ) {
        // IMPORTANT: In India, county is usually the taluka, not district!
        // Only use it if it's clearly not a district (doesn't contain "District")
        if (!address.county.toLowerCase().includes("district")) {
          taluka = address.county;
      } else {
          // If county contains "District", it might actually be the district
          // But only use it if we don't have a district already
          if (!district) {
            district = address.county.replace(/\s+district$/i, "").trim();
          }
        }
      }

      // State/Region mapping
      const state =
        address.state ||
        address.region ||
        address.province ||
        address.state_district ||
        "";

      // Parse display_name to extract missing fields
      // Indian address format: "Street, City/Town, Taluka, District, State, Pincode, Country"
      if (displayName) {
        const parts = displayName.split(",").map((p: string) => p.trim());
        const stateLower = state.toLowerCase();

        // First pass: Extract street from first part if available
        if (!street && parts.length > 0) {
          const firstPart = parts[0].trim();
          // If first part doesn't look like a city/district/state, it might be street
          if (
            firstPart &&
            !firstPart.toLowerCase().includes("district") &&
            firstPart.toLowerCase() !== stateLower &&
            !firstPart.match(/^\d{6}$/) &&
            firstPart.length > 3
          ) {
            street = firstPart;
          }
        }

        // Process parts in order (skip first part as it's usually street)
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];

          // Skip if it's pincode (6 digits), country, or state
          if (
            !part ||
            part.match(/^\d{6}$/) ||
            part.toLowerCase() === "india" ||
            part.toLowerCase() === stateLower
          ) {
            continue;
          }

          // Check if part contains "District" - this is definitely a district
          if (part.toLowerCase().includes("district")) {
            if (!district) {
              district = part.replace(/\s+district$/i, "").trim();
            }
            // Don't use this for city
            continue;
          }

          // If city is missing, try to set it (but not if it looks like district)
          if (!city) {
            // Check if this part looks like a city/town (not too long, not a number, not district-like)
            if (
              part.length > 1 &&
              part.length < 50 &&
              !part.match(/^\d+$/) &&
              !part.toLowerCase().includes("district") &&
              part !== district &&
              part !== taluka
            ) {
              // Usually city comes early in the address (before taluka/district)
              if (i < parts.length - 4) {
                city = part;
                continue;
              }
            }
          }

          // If taluka is missing and part is different from city and district
          if (
            !taluka &&
            part !== city &&
            part !== district &&
            part.length > 1 &&
            !part.toLowerCase().includes("district")
          ) {
            // Check if it could be taluka (usually comes after city in Indian addresses)
            const cityIndex = parts.findIndex((p: string) => p.trim() === city);
            if (cityIndex !== -1 && i > cityIndex && i < parts.length - 3) {
              taluka = part;
              continue;
            }
          }

          // If district is missing and part is different from city and taluka
          if (
            !district &&
            part !== city &&
            part !== taluka &&
            part.length > 1
          ) {
            // District usually comes after taluka but before state
            const talukaIndex = parts.findIndex(
              (p: string) => p.trim() === taluka
            );
            const stateIndex = parts.findIndex(
              (p: string) => p.trim().toLowerCase() === stateLower
            );
            if (
              (talukaIndex === -1 || i > talukaIndex) &&
              (stateIndex === -1 || i < stateIndex)
            ) {
              district = part;
            }
          }
        }
      }

      // Additional fallback: If district is empty, try city_district
      // NOTE: We don't use county here because in India, county = taluka
      if (!district) {
        if (address.city_district && address.city_district !== city) {
          district = address.city_district.replace(/\s+district$/i, "").trim();
        }
      }

      // If city contains "District", it's actually the district, not the city
      if (city && city.toLowerCase().includes("district")) {
        // Move city value to district
        if (!district) {
          district = city.replace(/\s+district$/i, "").trim();
        }
        // Clear city and try to find actual city
        city = "";
        // Try to find city from other fields
        city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          "";
        // Filter out district-like values
        if (city && (city.toLowerCase().includes("district") || city === district)) {
          city = "";
        }
      }

      // If district is same as city, try to find a different value
      if (district === city && city) {
        // Try to use city_district if different
        if (address.city_district && address.city_district !== city) {
          district = address.city_district.replace(/\s+district$/i, "").trim();
        } else {
          // If still same, check display_name for a different value between city and state
          if (displayName) {
            const parts = displayName.split(",").map((p: string) => p.trim());
            const cityIndex = parts.findIndex((p: string) => p.trim() === city);
            const stateIndex = parts.findIndex(
              (p: string) => p.trim().toLowerCase() === state.toLowerCase()
            );
            if (
              cityIndex !== -1 &&
              stateIndex !== -1 &&
              stateIndex > cityIndex + 1
            ) {
              // Look for a value between city and state that could be district
              for (let i = cityIndex + 1; i < stateIndex; i++) {
                const part = parts[i];
                if (
                  part &&
                  part !== city &&
                  part !== taluka &&
                  !part.match(/^\d+$/) &&
                  part.length > 2 &&
                  !part.toLowerCase().includes("district")
                ) {
                  // If we find a value that contains "district", use it
                  if (part.toLowerCase().includes("district")) {
                    district = part.replace(/\s+district$/i, "").trim();
                    break;
                  } else if (!district) {
                    district = part;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      // Additional fallback for taluka
      if (!taluka) {
        if (
          address.subdistrict &&
          address.subdistrict !== city &&
          address.subdistrict !== district
        ) {
          taluka = address.subdistrict;
        } else if (displayName && city && district) {
          // Try to extract taluka from display_name between city and district
          const parts = displayName.split(",").map((p: string) => p.trim());
          const cityIndex = parts.findIndex((p: string) => p.trim() === city);
          const districtIndex = parts.findIndex(
            (p: string) => p.trim() === district
          );
          if (
            cityIndex !== -1 &&
            districtIndex !== -1 &&
            districtIndex > cityIndex + 1
          ) {
            // Look for a value between city and district
            for (let i = cityIndex + 1; i < districtIndex; i++) {
              const part = parts[i];
              if (
                part &&
                part !== city &&
                part !== district &&
                !part.match(/^\d+$/) &&
                part.length > 2
              ) {
                taluka = part;
                break;
              }
            }
          }
        }
      }

      // Map OpenStreetMap address format to our format
      const mappedAddress = {
        street: street,
        city: city,
        district: district,
        taluka: taluka,
        state: state,
        pincode: address.postcode || "",
        country: address.country || "India",
        latitude: latitude,
        longitude: longitude,
      };

      // Log for debugging - show full address structure
      console.log("Location data:", {
        coordinates: { lat: latitude, lng: longitude },
        rawAddress: address,
        displayName: displayName,
        mappedAddress: mappedAddress,
      });

      // Update form with fetched address
      setEditForm((prev) => ({
        ...prev,
        currentAddress: {
          ...prev.currentAddress,
          ...mappedAddress,
        },
      }));

      toast({
        title: "Success",
        description: "Location detected and address filled automatically",
      });
    } catch (error: any) {
      console.error("Error getting location:", error);

      let errorMessage = "Failed to get your location";
      if (error.code === 1) {
        errorMessage =
          "Location access denied. Please enable location permissions in your browser settings.";
      } else if (error.code === 2) {
        errorMessage =
          "Location unavailable. Please check your device settings.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Add share profile function
  const handleShareProfile = async () => {
    try {
      // Check if user has mess details
      if (!profile?.messDetails?.messId) {
        toast({
          title: "Info",
          description: "You don't have an active mess profile to share.",
        });
        return;
      }

      // Create shareable link using the mess ID from user profile
      const shareUrl = `${window.location.origin}/mess/${profile.messDetails.messId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Success",
        description:
          "Mess profile link copied to clipboard! Share it with your friends.",
      });
    } catch (error) {
      console.error("Share profile error:", error);
      toast({
        title: "Error",
        description: "Failed to share profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Section-specific save handlers
  const handleSavePersonalInfo = async () => {
    // Validate at least one status is selected
    if (!editForm.isStudent && !editForm.isWorking) {
      toast({
        title: "Validation Error",
        description: "Please select at least one status (Student or Working)",
        variant: "destructive",
      });
      return;
    }

    await updateProfileSection(
      {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        isStudent: editForm.isStudent,
        isWorking: editForm.isWorking,
      },
      "Personal information",
      setIsEditingPersonalInfo
    );
  };

  const handleSaveAddress = async () => {
    await updateProfileSection(
      { currentAddress: editForm.currentAddress },
      "Address",
      setIsEditingAddress
    );
  };

  const handleSaveStudentInfo = async () => {
    await updateProfileSection(
      { studentInfo: editForm.studentInfo },
      "Student information",
      setIsEditingStudentInfo
    );
  };

  const handleSaveProfessionInfo = async () => {
    await updateProfileSection(
      { professionInfo: editForm.professionInfo },
      "Profession information",
      setIsEditingProfessionInfo
    );
  };

  // Section-specific cancel handlers
  const handleCancelPersonalInfo = () => {
    setIsEditingPersonalInfo(false);
    if (profile) {
      setEditForm(mapProfileToForm(profile));
    }
  };

  const handleCancelAddress = () => {
    setIsEditingAddress(false);
    if (profile) {
      setEditForm((prev) => ({
        ...prev,
        currentAddress: {
          street: (profile.currentAddress as any)?.street || "",
          city: (profile.currentAddress as any)?.city || "",
          district: (profile.currentAddress as any)?.district || "",
          taluka: (profile.currentAddress as any)?.taluka || "",
          state: (profile.currentAddress as any)?.state || "",
          pincode: (profile.currentAddress as any)?.pincode || "",
          country: (profile.currentAddress as any)?.country || "India",
          latitude: (profile.currentAddress as any)?.latitude,
          longitude: (profile.currentAddress as any)?.longitude,
        },
      }));
    }
  };

  const handleCancelStudentInfo = () => {
    setIsEditingStudentInfo(false);
    if (profile) {
      setEditForm((prev) => ({
        ...prev,
        studentInfo: {
          college: profile.studentInfo?.college || profile.college || "",
          course: profile.studentInfo?.course || profile.course || "",
          year: profile.studentInfo?.year || "",
          branch: profile.studentInfo?.branch || "",
          collegeEmailId: profile.studentInfo?.collegeEmailId || "",
          educationCategory: profile.studentInfo?.educationCategory || "college",
          schoolClass: profile.studentInfo?.schoolClass || "",
          schoolStream: profile.studentInfo?.schoolStream || "",
          competitiveExam: profile.studentInfo?.competitiveExam || "",
          academyName: profile.studentInfo?.academyName || "",
        },
      }));
    }
  };

  const handleCancelProfessionInfo = () => {
    setIsEditingProfessionInfo(false);
    if (profile) {
      setEditForm((prev) => ({
        ...prev,
        professionInfo: {
          company: profile.professionInfo?.company || "",
          designation: profile.professionInfo?.designation || "",
          department: profile.professionInfo?.department || "",
          workExperience: profile.professionInfo?.workExperience || 0,
          workLocation: profile.professionInfo?.workLocation || "",
          employeeId: profile.professionInfo?.employeeId || "",
          joiningDate: profile.professionInfo?.joiningDate || "",
        },
      }));
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Use userService instead of raw fetch
      const result = await userService.uploadAvatar(file);
      
      if (result.success && result.data) {
        // Extract avatar URL from response (could be in different fields)
        const apiData = result.data as any;
        const avatarUrl = apiData.avatar || apiData.profilePicture || apiData.messPhotoUrl || apiData.data?.avatar;
        if (avatarUrl) {
          setProfile((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
          toast({
            title: "Success",
            description: "Profile picture updated successfully",
          });
        } else {
          throw new Error("Avatar URL not found in response");
        }
      } else {
        throw new Error(result.message || "Failed to upload avatar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-SmartMess-light-border dark:SmartMess-dark-border rounded"></div>
            <div className="h-64 bg-SmartMess-light-border dark:SmartMess-dark-border rounded"></div>
            <div className="h-96 bg-SmartMess-light-border dark:SmartMess-dark-border rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg p-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
            Failed to load profile data
          </p>
          <button 
            onClick={() => {
              fetchProfile();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isMockData = profile.email === "test@example.com";
  
  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg pb-20 md:pb-0">
      {isMockData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>Development Mode:</strong> Showing mock data for testing purposes. The
                backend API is working but authentication is required for real data.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <CommonHeader
        title="My Profile"
        subtitle="Manage your personal information and mess details"
        showUserProfile
        onUserProfileClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        user={
          profile 
            ? {
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: profile.role,
                email: profile.email,
                ...(profile.avatar && { avatar: profile.avatar }),
              }
            : { firstName: "", lastName: "", role: "", email: "" }
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-2 lg:p-6 space-y-4 lg:space-y-6">
        <ProfileHeroCard
          profile={profile}
          getStatusColor={getStatusColor}
          onShareProfile={handleShareProfile}
          onAvatarUpload={handleAvatarUpload}
        />

        <MobileProfileNav
          sections={USER_PROFILE_SECTIONS}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface sticky top-0 z-10"
        />

        <PersonalInfoSection
          profile={profile}
          editForm={editForm}
          isEditing={isEditingPersonalInfo}
          isActive={activeSection === "information"}
          onEdit={() => setIsEditingPersonalInfo(true)}
          onSave={handleSavePersonalInfo}
          onCancel={handleCancelPersonalInfo}
          setEditForm={setEditForm}
        />

        <AddressSection
          profile={profile}
          editForm={editForm}
          isEditing={isEditingAddress}
          isActive={activeSection === "information"}
          isLoadingLocation={isLoadingLocation}
          onEdit={() => setIsEditingAddress(true)}
          onSave={handleSaveAddress}
          onCancel={handleCancelAddress}
          onGetLocation={getCurrentLocationAndAddress}
          setEditForm={setEditForm}
        />

        {(profile.isStudent || (isEditingPersonalInfo && editForm.isStudent)) && (
          <StudentInfoSection
            profile={profile}
            editForm={editForm}
            isEditing={isEditingStudentInfo}
            isActive={activeSection === "information"}
            onEdit={() => setIsEditingStudentInfo(true)}
            onSave={handleSaveStudentInfo}
            onCancel={handleCancelStudentInfo}
            setEditForm={setEditForm}
          />
        )}

        {(profile.isWorking || (isEditingPersonalInfo && editForm.isWorking)) && (
          <ProfessionInfoSection
            profile={profile}
            editForm={editForm}
            isEditing={isEditingProfessionInfo}
            isActive={activeSection === "information"}
            onEdit={() => setIsEditingProfessionInfo(true)}
            onSave={handleSaveProfessionInfo}
            onCancel={handleCancelProfessionInfo}
            setEditForm={setEditForm}
          />
        )}

        <ActivitiesSection
          activities={activities}
          isActive={activeSection === "activities"}
        />

        <SubscriptionsSection isActive={activeSection === "subscriptions"} />
      </div>
    </div>
  );
};

export default Profile;
