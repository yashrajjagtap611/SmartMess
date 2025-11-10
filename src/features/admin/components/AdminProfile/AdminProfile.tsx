import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminProfile: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev] as Record<string, unknown>;
        return {
          ...prev,
          [parent as keyof typeof prev]: {
            ...parentValue,
            [child as string]: value
          } as typeof prev[keyof typeof prev]
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: '',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Status & Notifications */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Account Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Type</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Administrator
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Login</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={formData.notifications.email}
                  onCheckedChange={(checked) => handleInputChange('notifications.email', checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive browser notifications
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={formData.notifications.push}
                  onCheckedChange={(checked) => handleInputChange('notifications.push', checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive text messages
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={formData.notifications.sms}
                  onCheckedChange={(checked) => handleInputChange('notifications.sms', checked)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;





