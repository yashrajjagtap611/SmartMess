import React, { useRef, useState } from 'react';
import {
  UserIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon,
  UsersIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useMessOwnerProfile } from './Profile.hooks';
import { formatDate, formatCurrency, getStatusColor } from './Profile.utils';
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
  MESS_OWNER_PROFILE_SECTIONS,
} from '@/components/common/MobileProfileNav';
import { ROUTES } from '@/constants/routes';

const Profile: React.FC = () => {
  const {
    profile,
    isLoading,
    personalForm,
    setPersonalForm,
    savePersonalInfo,
    resetPersonalForm,
    isSavingPersonal,
    hasMessProfile,
    uploadAvatar,
  } = useMessOwnerProfile();

  const [activeSection, setActiveSection] = useState<string>('information');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  // Debug active section changes
  const handleSectionChange = (sectionId: string) => {
    console.log('Mess Owner Profile: Changing active section from', activeSection, 'to', sectionId);
    setActiveSection(sectionId);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handlePersonalSave = async () => {
    const success = await savePersonalInfo(personalForm);
    if (success) {
      setIsEditingPersonal(false);
    }
  };

  const handlePersonalCancel = () => {
    resetPersonalForm();
    setIsEditingPersonal(false);
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

  const messProfile = profile.messProfile ?? null;
  const messLocation = messProfile?.location;
  const messTypes = messProfile?.types ?? [];
  const messColleges = messProfile?.colleges ?? [];
  const messAddress = profile.messAddress || 'Not provided';
  const ownerPhone = messProfile?.ownerPhone || profile.phone || 'Not provided';
  const ownerEmail = messProfile?.ownerEmail || profile.email;

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg pb-20 md:pb-0">
      <CommonHeader
        title="Mess Owner Profile"
        subtitle="Manage your mess owner profile and business information"
        showUserProfile
        user={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: 'mess-owner',
          email: profile.email,
          ...(profile.avatar ? { avatar: profile.avatar } : {}),
        }}
      />
      <div className="max-w-6xl mx-auto px-4 py-2 lg:p-6 space-y-4 lg:space-y-6">

        {/* Profile Card */}
        <Card className="overflow-hidden">
          {/* Cover Section */}
          <div className="h-32 bg-gradient-to-r from-SmartMess-primary via-SmartMess-secondary to-orange-500 relative">
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
                      <UserIcon className="h-16 w-16 text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
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
                  <h2 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    Mess Owner • {profile.messProfile?.name || 'Set up your mess profile'}
                  </p>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    {profile.ownerEmail || profile.email}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-col items-start lg:items-end space-y-2 mt-4 lg:mt-0">
                <Badge className={getStatusColor(profile.status)}>
                  {profile.status === 'active' ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      Suspended
                    </>
                  )}
                </Badge>
                {profile.isVerified && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.rating && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
                    <StarIcon className="h-3 w-3 mr-1" />
                    {profile.rating.toFixed(1)} ★
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-SmartMess-light-bg dark:SmartMess-dark-bg border border-border dark:border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-SmartMess-primary/10 rounded-lg">
                      <UsersIcon className="h-6 w-6 text-SmartMess-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted">Total Users</p>
                      <p className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text">
                        {profile.totalUsers ?? 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-SmartMess-light-bg dark:SmartMess-dark-bg border border-border dark:border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CurrencyRupeeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted">Monthly Revenue</p>
                      <p className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text">
                        {formatCurrency(profile.monthlyRevenue ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-SmartMess-light-bg dark:SmartMess-dark-bg border border-border dark:border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted">Member Since</p>
                      <p className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text">
                        {formatDate(profile.createdAt)}
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
          sections={MESS_OWNER_PROFILE_SECTIONS}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface sticky top-0 z-10"
        />

        {/* Detailed Information Section */}
        <div className={`${activeSection === 'information' ? 'block' : 'hidden md:block'} grid grid-cols-1 lg:grid-cols-2 gap-6`}>
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isEditingPersonal ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handlePersonalSave}
                      disabled={isSavingPersonal}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSavingPersonal ? (
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
                      size="sm"
                      onClick={handlePersonalCancel}
                      variant="outline"
                      disabled={isSavingPersonal}
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      resetPersonalForm();
                      setIsEditingPersonal(true);
                    }}
                    className="bg-SmartMess-primary hover:bg-SmartMess-primary-dark text-white"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Personal Info
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Full Name</Label>
                {isEditingPersonal ? (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      id="firstName"
                      value={personalForm.firstName}
                      onChange={(e) =>
                        setPersonalForm((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      placeholder="First Name"
                    />
                    <Input
                      id="lastName"
                      value={personalForm.lastName}
                      onChange={(e) =>
                        setPersonalForm((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text font-medium">
                    {profile.firstName} {profile.lastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text">{profile.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditingPersonal ? (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <Input
                      id="phone"
                      type="tel"
                      value={personalForm.phone}
                      onChange={(e) =>
                        setPersonalForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                      {profile.phone || 'Not provided'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditingPersonal ? (
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-2" />
                    <Textarea
                      id="address"
                      value={personalForm.address}
                      onChange={(e) =>
                        setPersonalForm((prev) => ({ ...prev, address: e.target.value }))
                      }
                      placeholder="Enter your address"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-1" />
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                      {profile.address || 'Not provided'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                {isEditingPersonal ? (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <Input
                      id="dob"
                      type="date"
                      value={personalForm.dob || ''}
                      onChange={(e) =>
                        setPersonalForm((prev) => ({ ...prev, dob: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                      {formatDate(profile.dateOfBirth)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {isEditingPersonal ? (
                  <Select
                    value={personalForm.gender}
                    onValueChange={(value) =>
                      setPersonalForm((prev) => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))
                    }
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
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text capitalize">
                    {profile.gender || 'Not provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mess Information */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BuildingStorefrontIcon className="h-5 w-5" />
                    <span>Mess Information</span>
                  </CardTitle>
                  <CardDescription>Your mess business details</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={ROUTES.MESS_OWNER.SETTINGS_PROFILE} className="flex items-center gap-2">
                      <CogIcon className="h-4 w-4" />
                      Edit in Settings
                    </Link>
                  </Button>
                </div>
              </div>

              {!hasMessProfile && (
                <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100">
                  <AlertDescription>
                    You have not set up your mess profile yet. Use the Settings page to add your mess details so students can discover you easily.
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {hasMessProfile && messProfile ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Mess Name</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text font-medium">
                        {messProfile.name || 'Not provided'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label>Owner Contact Number</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">{ownerPhone}</p>
                    </div>

                    <div className="space-y-1">
                      <Label>Owner Email</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">{ownerEmail}</p>
                    </div>

                    <div className="space-y-1">
                      <Label>Mess Types</Label>
                      {messTypes.length ? (
                        <div className="flex flex-wrap gap-2">
                          {messTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="capitalize">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-SmartMess-light-text dark:SmartMess-dark-text">Not provided</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label>Mess Address</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">{messAddress}</p>
                    </div>

                    <div className="space-y-1">
                      <Label>City</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                        {messLocation?.city || 'Not provided'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label>District</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                        {messLocation?.district || 'Not provided'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label>State</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                        {messLocation?.state || 'Not provided'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label>Pincode</Label>
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                        {messLocation?.pincode || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nearby Colleges / Institutes</Label>
                    {messColleges.length ? (
                      <ul className="list-disc list-inside space-y-1 text-SmartMess-light-text dark:SmartMess-dark-text">
                        {messColleges.map((college) => (
                          <li key={college}>{college}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-SmartMess-light-text dark:SmartMess-dark-text">Not provided</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text">
                    No mess information is available yet. Head over to your settings to create or update your mess profile.
                  </p>
                  <Button asChild className="w-full sm:w-auto">
                    <Link to={ROUTES.MESS_OWNER.SETTINGS_PROFILE} className="flex items-center justify-center gap-2">
                      <CogIcon className="h-4 w-4" />
                      Open Settings
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;