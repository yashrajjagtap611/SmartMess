import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../components/ui/avatar";
import { Badge } from "../../../../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Mail, Phone, Edit, Save, X, Shield, Calendar, Upload, CheckCircle, AlertCircle, RefreshCw, MapPin, Clock } from "lucide-react";
import { useToast } from "../../../../../hooks/use-toast";
import userService from "../../../../../services/api/userService";
import type { UserProfile } from "../../../../../services/api/userService";
import { getMessProfile, updateMessProfile } from "../../../../../services/messProfileService";
import type { MessProfile } from "../../../../../services/messProfileService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../components/ui/tooltip";
import { Separator } from "../../../../../components/ui/separator";
import { useUser } from "@/contexts/AuthContext";
import { CommonHeader } from '@/components/common/Header/CommonHeader';

// Utility function to clean payload
function cleanPayload<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        (typeof value !== 'string' || value.trim() !== '')
    )
  ) as Partial<T>;
}

const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const result = date.toISOString().split('T')[0];
    return result || "";
  } catch {
    return "";
  }
};

const Profile: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { toast } = useToast();
  const { refreshUser } = useUser();

  // State
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [messProfile, setMessProfile] = useState<MessProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImagePreview, setProfileImagePreview] = useState<string | undefined>(undefined);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    gender: "other" as "male" | "female" | "other",
    dob: "",
    status: "active" as "active" | "suspended"
  });

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch user and mess profile
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // User profile
        const userRes = await userService.getProfile();
        if (userRes.success && userRes.data) {
          setUserInfo(userRes.data);
          setProfileImagePreview(userRes.data.avatar);
          setEditForm((prev) => ({
            ...prev,
            firstName: userRes.data!.firstName,
            lastName: userRes.data!.lastName,
            address: userRes.data!.address || "",
            gender: userRes.data!.gender || "other",
            dob: formatDateForInput(userRes.data!.dob),
            status: userRes.data!.status || "active"
          }));
        }
        // Mess profile
        const mess = await getMessProfile();
        setMessProfile(mess);
        setEditForm((prev) => ({
          ...prev,
          phone: mess.ownerPhone || ""
        }));
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Handle form changes
  const handleFormChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Profile image upload
  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!userInfo || !messProfile) return;
    // Frontend phone validation
    const phonePattern = /^[+]?\d{10,15}$/;
    if (!phonePattern.test(editForm.phone.trim())) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (10-15 digits, optional + at start).",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    try {
      // 1. Upload avatar if changed
      let avatarUrl = userInfo.avatar;
      if (profileImageFile) {
        const uploadRes = await userService.uploadAvatar(profileImageFile);
        if (uploadRes.success && uploadRes.data) {
          avatarUrl = uploadRes.data.avatar;
          refreshUser(); // Refresh user context after avatar upload
        } else {
          throw new Error(uploadRes.message || "Failed to upload avatar");
        }
      }
      // 2. Update user profile
      const payload = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        avatar: avatarUrl,
        address: editForm.address,
        gender: editForm.gender,
        dob: editForm.dob,
        status: editForm.status
      };
      const cleanedPayload = cleanPayload(payload);
      console.log("Payload sent to updateProfile:", cleanedPayload);
      const userUpdateRes = await userService.updateProfile(cleanedPayload);
      if (!userUpdateRes.success) throw new Error(userUpdateRes.message);
      // 3. Update mess profile (phone)
      const messUpdateRes = await updateMessProfile({ ownerPhone: editForm.phone });
      // 4. Refetch and update UI
      setUserInfo(userUpdateRes.data!);
      setMessProfile(messUpdateRes);
      // Update localStorage with new user info (including avatar)
      if (userUpdateRes.data) {
        localStorage.setItem('userInfo', JSON.stringify(userUpdateRes.data));
      }
      setProfileImageFile(null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      // Show backend error message if available
      let errorMsg = error?.message || "Failed to update profile";
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (userInfo && messProfile) {
      setEditForm({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phone: messProfile.ownerPhone || "",
        address: userInfo.address || "",
        gender: userInfo.gender || "other",
        dob: formatDateForInput(userInfo.dob),
        status: userInfo.status || "active"
      });
      setProfileImagePreview(userInfo.avatar);
      setProfileImageFile(null);
    }
    setIsEditing(false);
  };

  // Resend email verification (stub)
  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend verification API
      await new Promise((res) => setTimeout(res, 1000));
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  // Change password (stub)
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    setIsChangingPassword(true);
    try {
      // TODO: Implement password change API
      await new Promise((res) => setTimeout(res, 1000));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password Changed",
        description: "Your password has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={() => {}}
        />
        <div className="flex items-center justify-center min-h-screen lg:ml-56">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              Loading profile...
            </p>
          </div>
        </div>
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <CommonHeader
        title="Mess Owner Profile"
        subtitle="Manage your mess owner account details"
        variant="default"
      />
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={() => {}}
      />
      <div className="p-6 pb-24 transition-all duration-300 lg:ml-56">
        {/* Owner Information Card - always visible, responsive */}
        <div className="flex justify-center mb-8">
          <Card className="SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-border dark:SmartMess-dark-border shadow-xl w-full max-w-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center gap-2 relative">
                <div className="relative group">
                  <Avatar className="h-32 w-32 shadow-lg border-4 border-background">
                    <AvatarImage src={profileImagePreview || undefined} alt="Owner Profile" />
                    <AvatarFallback className="text-3xl SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground">
                      {userInfo ? `${userInfo.firstName[0]}${userInfo.lastName[0]}` : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="absolute bottom-2 right-2 cursor-pointer SmartMess-light-primary dark:SmartMess-dark-primary rounded-full p-2 shadow-lg hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors border-2 border-background">
                            <Upload className="w-6 h-6 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfileImageChange}
                            />
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>Change Profile Photo</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <CardTitle className="text-2xl mt-2">
                  {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Owner'}
                </CardTitle>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {userInfo?.role || 'user'}
                  </Badge>
                  <Badge variant={userInfo?.status === 'active' ? 'default' : 'destructive'}>
                    {userInfo?.status || 'active'}
                  </Badge>
                  {userInfo?.isVerified ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                {!userInfo?.isVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" style={{ display: isResending ? 'inline' : 'none' }} />
                    {isResending ? 'Resending...' : 'Resend Verification'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
                  <span className="text-sm">{userInfo?.email}</span>
                </div>
                {editForm.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
                    <span className="text-sm">{editForm.phone}</span>
                  </div>
                )}
                {editForm.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
                    <span className="text-sm">{editForm.address}</span>
                  </div>
                )}
              </div>
              <Separator className="my-2" />
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
                  <span className="text-sm">
                    Member since {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {userInfo?.lastLogin && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
                    <span className="text-sm">
                      Last login: {new Date(userInfo.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky/Shadowed Tabs navigation (no Activity tab) */}
        <div className="sticky top-0 z-20 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg shadow-md rounded-lg mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex justify-center gap-2 py-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            {/* Profile Tab: Responsive two-column grid, clear headers, dividers */}
            <TabsContent value="profile">
              <Card className="SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-border dark:SmartMess-dark-border p-6 max-w-4xl mx-auto">
                <CardTitle className="text-lg mb-4">Personal Details</CardTitle>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => handleFormChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {userInfo?.firstName || 'Not set'}
                      </p>
                    )}
                  </div>
                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) => handleFormChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {userInfo?.lastName || 'Not set'}
                      </p>
                    )}
                  </div>
                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                      {userInfo?.email || 'Not set'}
                    </p>
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {editForm.phone || 'Not set'}
                      </p>
                    )}
                  </div>
                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editForm.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        placeholder="Enter address"
                      />
                    ) : (
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {editForm.address || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
                <Separator className="my-6" />
                <CardTitle className="text-lg mb-4">Other Details</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <Select value={editForm.gender} onValueChange={(value) => handleFormChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text capitalize">
                        {editForm.gender || 'Not set'}
                      </p>
                    )}
                  </div>
                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dob"
                        type="date"
                        value={editForm.dob}
                        onChange={(e) => handleFormChange('dob', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {editForm.dob ? new Date(editForm.dob).toLocaleDateString() : 'Not set'}
                      </p>
                    )}
                  </div>
                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select value={editForm.status} onValueChange={(value) => handleFormChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text capitalize">
                        {editForm.status || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={handleSave}
                              disabled={isSaving}
                              className="transition-transform hover:scale-105"
                            >
                              {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Save
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save changes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCancel}
                              disabled={isSaving}
                              className="transition-transform hover:scale-105"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel editing</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => setIsEditing(true)}
                            className="transition-transform hover:scale-105"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit profile</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Security Tab: Carded, clear header, spacing */}
            <TabsContent value="security">
              <Card className="SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-border dark:SmartMess-dark-border p-6 max-w-lg mx-auto">
                <CardTitle className="text-lg mb-4">Change Password</CardTitle>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full mt-2 transition-transform hover:scale-105"
                  >
                    {isChangingPassword ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Change Password
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Subscription Tab: Carded, clear header, spacing */}
            <TabsContent value="subscription">
              <Card className="SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-border dark:SmartMess-dark-border p-6 max-w-lg mx-auto">
                <CardTitle className="text-lg mb-4">Subscription</CardTitle>
                <Separator className="mb-4" />
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  <strong>Mess subscription is required to use this platform.</strong>
                </p>
                {/* Placeholder for subscription status */}
                <Badge variant="secondary">Active</Badge>
                {/* You can replace the above with real subscription status */}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={() => {}}
      />
      {/*
        // Suggestions for future advanced features:
        // - Change Email flow (with verification)
        // - Deactivate/Delete Account button (with confirmation)
        // - Download Profile Data (GDPR/export)
        // - Two-Factor Authentication (2FA) setup
        // - Profile Completion progress bar
        // - Recent Devices/Active Sessions list
      */}
    </div>
  );
};

export default Profile;
