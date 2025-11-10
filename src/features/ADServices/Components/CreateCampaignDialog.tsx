import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adService } from '@/services/api/adService';
import type { CreateCampaignData, AdSettings } from '@/types/ads';
import { Loader2, Upload, X, Image as ImageIcon, Video, Calendar, Users, Link as LinkIcon, Filter, User } from 'lucide-react';
import apiClient from '@/services/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AudienceMember } from '@/types/ads';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [targetUserCount, setTargetUserCount] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [audienceList, setAudienceList] = useState<AudienceMember[]>([]);
  const [showAudienceList, setShowAudienceList] = useState(false);
  const [availableMesses, setAvailableMesses] = useState<Array<{ _id: string; name: string }>>([]);

  const [formData, setFormData] = useState<CreateCampaignData>({
    campaignType: 'ad_card',
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    linkUrl: '',
    callToAction: 'Learn More',
    audienceFilters: {},
    startDate: new Date().toISOString().split('T')[0] as string,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchSettings();
      fetchAvailableMesses();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      const response = await adService.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchAvailableMesses = async () => {
    try {
      const response = await apiClient.get('/mess/search/available');
      if (response.data.success && response.data.data) {
        setAvailableMesses(response.data.data.map((mess: any) => ({
          _id: mess._id || mess.id,
          name: mess.name
        })));
      }
    } catch (error: any) {
      console.error('Failed to fetch messes:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (check settings if available)
    const maxSize = settings?.policies.maxImageSizeMB || 5;
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'Error',
        description: `Image size must be less than ${maxSize}MB`,
        variant: 'destructive'
      });
      return;
    }

    setImageFile(file);
    setVideoFile(null);
    setVideoPreview('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (check settings if available)
    const maxSize = settings?.policies.maxVideoSizeMB || 50;
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'Error',
        description: `Video size must be less than ${maxSize}MB`,
        variant: 'destructive'
      });
      return;
    }

    setVideoFile(file);
    setImageFile(null);
    setImagePreview('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiClient.post('/ads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      }
      throw new Error(response.data.message || 'Upload failed');
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const calculateTargetUsers = async () => {
    // Check if any filter is set
    const hasFilters = formData.audienceFilters && (
      (formData.audienceFilters.roles && formData.audienceFilters.roles.length > 0) ||
      (formData.audienceFilters.genders && formData.audienceFilters.genders.length > 0) ||
      (formData.audienceFilters.messIds && formData.audienceFilters.messIds.length > 0) ||
      (formData.audienceFilters.membershipStatus && formData.audienceFilters.membershipStatus.length > 0) ||
      (formData.audienceFilters.ageRange && (formData.audienceFilters.ageRange.min || formData.audienceFilters.ageRange.max))
    );

    if (!hasFilters) {
      setTargetUserCount(0);
      setAudienceList([]);
      return;
    }

    try {
      setCalculating(true);
      const response = await adService.calculateTargetUserCount(formData.audienceFilters);
      if (response.success) {
        setTargetUserCount(response.data.targetUserCount);
      }
    } catch (error: any) {
      console.error('Failed to calculate target users:', error);
      setTargetUserCount(0);
    } finally {
      setCalculating(false);
    }
  };

  const fetchAudienceList = async () => {
    const hasFilters = formData.audienceFilters && (
      (formData.audienceFilters.roles && formData.audienceFilters.roles.length > 0) ||
      (formData.audienceFilters.genders && formData.audienceFilters.genders.length > 0) ||
      (formData.audienceFilters.messIds && formData.audienceFilters.messIds.length > 0) ||
      (formData.audienceFilters.membershipStatus && formData.audienceFilters.membershipStatus.length > 0) ||
      (formData.audienceFilters.ageRange && (formData.audienceFilters.ageRange.min || formData.audienceFilters.ageRange.max))
    );

    if (!hasFilters) {
      setAudienceList([]);
      return;
    }

    try {
      setLoadingAudience(true);
      const response = await adService.getAudienceList(formData.audienceFilters);
      if (response.success) {
        setAudienceList(response.data);
        setShowAudienceList(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch audience list',
        variant: 'destructive'
      });
    } finally {
      setLoadingAudience(false);
    }
  };

  useEffect(() => {
    calculateTargetUsers();
  }, [formData.audienceFilters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a campaign title',
        variant: 'destructive'
      });
      return;
    }

    if (formData.title.length > (settings?.policies.maxTitleLength || 100)) {
      toast({
        title: 'Error',
        description: `Title must be less than ${settings?.policies.maxTitleLength || 100} characters`,
        variant: 'destructive'
      });
      return;
    }

    if (formData.description && formData.description.length > (settings?.policies.maxDescriptionLength || 500)) {
      toast({
        title: 'Error',
        description: `Description must be less than ${settings?.policies.maxDescriptionLength || 500} characters`,
        variant: 'destructive'
      });
      return;
    }

    if (!imageFile && !videoFile && !formData.imageUrl && !formData.videoUrl) {
      toast({
        title: 'Error',
        description: 'Please upload an image or video for the ad',
        variant: 'destructive'
      });
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // Upload files if selected
      let imageUrl = formData.imageUrl;
      let videoUrl = formData.videoUrl;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'image');
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video');
      }

      // Create campaign
      const campaignData: CreateCampaignData = {
        campaignType: formData.campaignType,
        title: formData.title,
        ...(formData.description ? { description: formData.description } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(videoUrl ? { videoUrl } : {}),
        ...(formData.linkUrl ? { linkUrl: formData.linkUrl } : {}),
        ...(formData.callToAction ? { callToAction: formData.callToAction } : {}),
        audienceFilters: formData.audienceFilters,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      const response = await adService.createCampaign(campaignData);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Campaign created successfully',
          variant: 'default'
        });
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      campaignType: 'ad_card',
      title: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
      linkUrl: '',
      callToAction: 'Learn More',
      audienceFilters: {},
      startDate: new Date().toISOString().split('T')[0] as string,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string
    });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setVideoPreview('');
    setTargetUserCount(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ad Campaign</DialogTitle>
          <DialogDescription>
            Create a new advertising campaign with images or videos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Type */}
          <div className="space-y-2">
            <Label htmlFor="campaignType">Campaign Type</Label>
            <Select
              value={formData.campaignType}
              onValueChange={(value: 'ad_card' | 'messaging' | 'both') =>
                setFormData({ ...formData, campaignType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ad_card">Ad Card Only</SelectItem>
                <SelectItem value="messaging">Messaging Only</SelectItem>
                <SelectItem value="both">Both Ad Card & Messaging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter campaign title"
              maxLength={settings?.policies.maxTitleLength || 100}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length} / {settings?.policies.maxTitleLength || 100} characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter campaign description"
              maxLength={settings?.policies.maxDescriptionLength || 500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {(formData.description || '').length} / {settings?.policies.maxDescriptionLength || 500} characters
            </p>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <Label>Media (Image or Video) *</Label>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="imageUpload" className="flex items-center gap-2 cursor-pointer">
                <ImageIcon className="h-4 w-4" />
                Upload Image
              </Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                {imageFile && (
                  <span className="text-sm text-muted-foreground">
                    {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="max-w-full h-48 object-contain rounded-lg border" />
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label htmlFor="videoUpload" className="flex items-center gap-2 cursor-pointer">
                <Video className="h-4 w-4" />
                Upload Video
              </Label>
              <Input
                id="videoUpload"
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('videoUpload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Video
                </Button>
                {videoFile && (
                  <span className="text-sm text-muted-foreground">
                    {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
                {videoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {videoPreview && (
                <div className="mt-2">
                  <video src={videoPreview} controls className="max-w-full h-48 rounded-lg border" />
                </div>
              )}
            </div>

            {/* Or URL Input */}
            <div className="space-y-2">
              <Label>Or Enter Media URL</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Image URL"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  disabled={!!imageFile || !!videoFile}
                />
                <Input
                  placeholder="Video URL"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  disabled={!!imageFile || !!videoFile}
                />
              </div>
            </div>
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link URL
            </Label>
            <Input
              id="linkUrl"
              type="url"
              value={formData.linkUrl || ''}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          {/* Call to Action */}
          <div className="space-y-2">
            <Label htmlFor="callToAction">Call to Action</Label>
            <Input
              id="callToAction"
              value={formData.callToAction || 'Learn More'}
              onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
              placeholder="Learn More"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Audience Filters */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Audience Filters
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchAudienceList}
                disabled={loadingAudience || calculating || targetUserCount === 0}
              >
                {loadingAudience ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    View Audience
                  </>
                )}
              </Button>
            </div>

            {/* Target User Count */}
            {calculating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculating target users...
              </div>
            ) : (
              <div className="text-sm">
                <span className="font-semibold">Target Users: </span>
                <span>{targetUserCount.toLocaleString()}</span>
              </div>
            )}

            {/* Roles Filter */}
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-3">
                {['user', 'mess-owner', 'admin'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={formData.audienceFilters?.roles?.includes(role) || false}
                      onCheckedChange={(checked) => {
                        const currentRoles = formData.audienceFilters?.roles || [];
                        const newRoles = checked
                          ? [...currentRoles, role]
                          : currentRoles.filter((r) => r !== role);
                        setFormData({
                          ...formData,
                          audienceFilters: {
                            ...formData.audienceFilters,
                            ...(newRoles.length > 0 ? { roles: newRoles } : {})
                          }
                        });
                      }}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm font-normal cursor-pointer capitalize">
                      {role.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Genders Filter */}
            <div className="space-y-2">
              <Label>Genders</Label>
              <div className="flex flex-wrap gap-3">
                {['male', 'female', 'other'].map((gender) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gender-${gender}`}
                      checked={formData.audienceFilters?.genders?.includes(gender) || false}
                      onCheckedChange={(checked) => {
                        const currentGenders = formData.audienceFilters?.genders || [];
                        const newGenders = checked
                          ? [...currentGenders, gender]
                          : currentGenders.filter((g) => g !== gender);
                        setFormData({
                          ...formData,
                          audienceFilters: {
                            ...formData.audienceFilters,
                            ...(newGenders.length > 0 ? { genders: newGenders } : {})
                          }
                        });
                      }}
                    />
                    <Label htmlFor={`gender-${gender}`} className="text-sm font-normal cursor-pointer capitalize">
                      {gender}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mess Selection */}
            {availableMesses.length > 0 && (
              <div className="space-y-2">
                <Label>Messes (Select specific messes or leave empty for all)</Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-2">
                    {availableMesses.map((mess) => (
                      <div key={mess._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mess-${mess._id}`}
                          checked={formData.audienceFilters?.messIds?.includes(mess._id) || false}
                          onCheckedChange={(checked) => {
                            const currentMessIds = formData.audienceFilters?.messIds || [];
                            const newMessIds = checked
                              ? [...currentMessIds, mess._id]
                              : currentMessIds.filter((id) => id !== mess._id);
                            setFormData({
                              ...formData,
                              audienceFilters: {
                                ...formData.audienceFilters,
                                ...(newMessIds.length > 0 ? { messIds: newMessIds } : {})
                              }
                            });
                          }}
                        />
                        <Label htmlFor={`mess-${mess._id}`} className="text-sm font-normal cursor-pointer">
                          {mess.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Membership Status */}
            <div className="space-y-2">
              <Label>Membership Status</Label>
              <div className="flex flex-wrap gap-3">
                {['active', 'pending', 'inactive'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={formData.audienceFilters?.membershipStatus?.includes(status) || false}
                      onCheckedChange={(checked) => {
                        const currentStatus = formData.audienceFilters?.membershipStatus || [];
                        const newStatus = checked
                          ? [...currentStatus, status]
                          : currentStatus.filter((s) => s !== status);
                        setFormData({
                          ...formData,
                          audienceFilters: {
                            ...formData.audienceFilters,
                            ...(newStatus.length > 0 ? { membershipStatus: newStatus } : {})
                          }
                        });
                      }}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer capitalize">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageMin">Min Age</Label>
                <Input
                  id="ageMin"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.audienceFilters?.ageRange?.min || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseInt(e.target.value) : undefined;
                    setFormData({
                      ...formData,
                      audienceFilters: {
                        ...formData.audienceFilters,
                        ageRange: {
                          ...formData.audienceFilters?.ageRange,
                          ...(min !== undefined ? { min } : {})
                        }
                      }
                    });
                  }}
                  placeholder="Min"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageMax">Max Age</Label>
                <Input
                  id="ageMax"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.audienceFilters?.ageRange?.max || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseInt(e.target.value) : undefined;
                    setFormData({
                      ...formData,
                      audienceFilters: {
                        ...formData.audienceFilters,
                        ageRange: {
                          ...formData.audienceFilters?.ageRange,
                          ...(max !== undefined ? { max } : {})
                        }
                      }
                    });
                  }}
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Audience List */}
            {showAudienceList && audienceList.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold">
                      Audience List ({audienceList.length} users)
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAudienceList(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {audienceList.map((member) => (
                        <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg border">
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {showAudienceList && audienceList.length === 0 && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-center text-muted-foreground py-4">
                    No users match the selected filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading || uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignDialog;

