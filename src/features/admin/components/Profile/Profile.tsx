import React, { useRef, useState } from 'react';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  ClockIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAdminProfile } from './Profile.hooks';
import { formatDate, formatDateTime } from './Profile.utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommonHeader } from '@/components/common/Header';
import { 
  MobileProfileNav, 
  ADMIN_PROFILE_SECTIONS 
} from '@/components/common/MobileProfileNav';


const Profile: React.FC = () => {
  const {
    profile,
    isLoading,
    isSaving,
    isEditing,
    editForm,
    setEditForm,
    setIsEditing,
    updateProfile,
    uploadAvatar,
    handleCancel
  } = useAdminProfile();
  
  const [activeSection, setActiveSection] = useState<string>('information');

  // Debug active section changes
  const handleSectionChange = (sectionId: string) => {
    console.log('Admin Profile: Changing active section from', activeSection, 'to', sectionId);
    setActiveSection(sectionId);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const success = await updateProfile(editForm);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'super-admin' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          {/* Profile Card Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Failed to load profile data. Please try refreshing the page or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg pb-20 md:pb-0">
      {/* Common Header */}
      {profile ? (
        <CommonHeader
          title="Admin Profile"
          subtitle="Manage your administrator profile and security settings"
          showUserProfile={true}
          user={{
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
            ...(profile.avatar ? { avatar: profile.avatar } : {}),
            email: profile.email
          }}
        >
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-SmartMess-primary hover:bg-SmartMess-primary-dark text-white"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CommonHeader>
      ) : (
        <CommonHeader
          title="Admin Profile"
          subtitle="Manage your administrator profile and security settings"
          showUserProfile={true}
        >
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-SmartMess-primary hover:bg-SmartMess-primary-dark text-white"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CommonHeader>
      )}
      <div className="max-w-6xl mx-auto px-4 py-2 lg:p-6 space-y-4 lg:space-y-6">

        {/* Profile Card */}
        <Card className="overflow-hidden">
          {/* Cover Section */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          
          <CardContent className="p-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-SmartMess-light-surface dark:SmartMess-dark-surface bg-SmartMess-light-border dark:SmartMess-dark-border dark:bg-SmartMess-light-border dark:SmartMess-dark-border flex items-center justify-center overflow-hidden shadow-lg">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CameraIcon className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    {profile.role === 'super-admin' ? 'Super Administrator' : 'System Administrator'} • {profile.department}
                  </p>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    Employee ID: {profile.employeeId}
                  </p>
                </div>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-col items-start lg:items-end space-y-2 mt-4 lg:mt-0">
                <Badge className={`${getRoleColor(profile.role)}`}>
                  {profile.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                </Badge>
                <Badge className={`${getSecurityLevelColor(profile.securityLevel)}`}>
                  {profile.securityLevel.charAt(0).toUpperCase() + profile.securityLevel.slice(1)} Security
                </Badge>
                <Badge className={
                  profile.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800'
                }>
                  {profile.isActive ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Last Login</p>
                      <p className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {formatDateTime(profile.lastLogin)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <ComputerDesktopIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Total Logins</p>
                      <p className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {profile.loginCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <KeyIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Permissions</p>
                      <p className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {profile.permissions.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Navigation */}
        <MobileProfileNav
          sections={ADMIN_PROFILE_SECTIONS}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface sticky top-0 z-10"
        />

        {/* Detailed Information Section */}
        <div className={`${activeSection === 'information' ? 'block' : 'hidden md:block'} grid grid-cols-1 lg:grid-cols-2 gap-6`}>
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Full Name</Label>
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First Name"
                    />
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text font-medium">
                    {profile.firstName} {profile.lastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <Input
                      id="phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                      {profile.phone}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-2" />
                    <Textarea
                      id="address"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your address"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-1" />
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                      {profile.address}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                      {formatDate(profile.dateOfBirth)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <Select
                    value={editForm.gender ?? ''}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}
                  >
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
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text capitalize">
                    {profile.gender || 'Not specified'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Administrative Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Administrative Information</span>
              </CardTitle>
              <CardDescription>
                Your role, permissions, and system access details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {profile.role === 'super-admin' ? 'Super Administrator' : 'Administrator'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <Input
                      id="department"
                      value={editForm.department}
                      onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter department"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                      {profile.department}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Employee ID</Label>
                <div className="flex items-center space-x-2">
                  <IdentificationIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text font-mono">
                    {profile.employeeId}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Security Level</Label>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {profile.securityLevel.charAt(0).toUpperCase() + profile.securityLevel.slice(1)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {formatDate(profile.accountCreated)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {formatDateTime(profile.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Section */}
        <div className={`${activeSection === 'permissions' ? 'block' : 'hidden md:block'}`}>
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <KeyIcon className="h-5 w-5" />
              <span>Permissions & Access</span>
            </CardTitle>
            <CardDescription>
              Your current permissions and access levels in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {profile.permissions.map((permission, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="justify-center py-2"
                >
                  {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>


      </div>
    </div>
  );
};

export default Profile; 