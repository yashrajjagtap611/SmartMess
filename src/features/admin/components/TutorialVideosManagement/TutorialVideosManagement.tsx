import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Loader2, Video, Play, Wand2 } from 'lucide-react';
import { useTutorialVideosManagement } from './TutorialVideosManagement.hooks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { autoGetYouTubeThumbnail, getYouTubeEmbedUrl, isYouTubeUrl } from '@/utils/youtubeUtils';

export default function TutorialVideosManagement() {
  const {
    videos,
    loading,
    createVideo,
    updateVideo,
    deleteVideo,
    refreshVideos,
  } = useTutorialVideosManagement();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: 'general' as 'user' | 'mess-owner' | 'general',
    order: 0,
    thumbnailUrl: '',
    duration: '',
    isActive: true,
  });
  const { toast } = useToast();

  const handleOpenCreate = () => {
    setSelectedVideo(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      category: 'general',
      order: 0,
      thumbnailUrl: '',
      duration: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (video: any) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      category: video.category,
      order: video.order,
      thumbnailUrl: video.thumbnailUrl || '',
      duration: video.duration || '',
      isActive: video.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAutoFillThumbnail = () => {
    if (!formData.videoUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a video URL first',
        variant: 'destructive',
      });
      return;
    }

    // Check if it's a YouTube URL and auto-generate thumbnail
    if (isYouTubeUrl(formData.videoUrl)) {
      const thumbnailUrl = autoGetYouTubeThumbnail(formData.videoUrl);
      const embedUrl = getYouTubeEmbedUrl(formData.videoUrl);
      
      if (thumbnailUrl) {
        setFormData({ 
          ...formData, 
          videoUrl: embedUrl,
          thumbnailUrl 
        });
        
        toast({
          title: 'Success',
          description: 'Thumbnail and embed URL generated from YouTube',
        });
      }
    } else {
      toast({
        title: 'Info',
        description: 'Please enter a YouTube URL to auto-generate thumbnail',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      // Convert to embed URL if YouTube
      const videoUrl = isYouTubeUrl(formData.videoUrl) 
        ? getYouTubeEmbedUrl(formData.videoUrl)
        : formData.videoUrl;

      const dataToSave = { ...formData, videoUrl };

      if (selectedVideo) {
        await updateVideo(selectedVideo._id, dataToSave);
        toast({
          title: 'Success',
          description: 'Tutorial video updated successfully',
        });
      } else {
        await createVideo(dataToSave);
        toast({
          title: 'Success',
          description: 'Tutorial video created successfully',
        });
      }
      setIsDialogOpen(false);
      refreshVideos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save tutorial video',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVideo(selectedVideo._id);
      toast({
        title: 'Success',
        description: 'Tutorial video deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedVideo(null);
      refreshVideos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tutorial video',
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'mess-owner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Tutorial Videos Management</h1>
          <p className="text-muted-foreground">
            Manage platform tutorial videos for users and mess owners
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Video
        </Button>
      </div>

      {/* Video List */}
      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
 chromatic <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No tutorial videos yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Add Video" to create your first tutorial video
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className={getCategoryColor(video.category)}>
                    {video.category}
                  </Badge>
                  <Badge variant={video.isActive ? 'default' : 'secondary'}>
                    {video.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{video.title}</CardTitle>
                {video.description && (
                  <CardDescription className="line-clamp-2">
                    {video.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-8 w-8 text-white" fill="white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenEdit(video)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedVideo(video);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVideo ? 'Edit Tutorial Video' : 'Create Tutorial Video'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the tutorial video
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter video title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter video description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAutoFillThumbnail}
                  title="Auto-fill thumbnail from YouTube URL"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste any YouTube URL and click the magic wand to auto-generate thumbnail and convert to embed URL
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="mess-owner">Mess Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="5:30"
                />
              </div>
              <div className="flex items-center justify-center pt-8">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedVideo ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tutorial video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


