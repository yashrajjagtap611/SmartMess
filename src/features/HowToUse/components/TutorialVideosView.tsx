import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Video, Film } from 'lucide-react';
import { tutorialVideosService, TutorialVideo } from '@/services/tutorialVideosService';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout';

interface TutorialVideosViewProps {
  userRole?: 'user' | 'mess-owner' | 'admin';
}

export default function TutorialVideosView({ userRole }: TutorialVideosViewProps) {
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const allVideos = await tutorialVideosService.getAll();
      
      // Filter by user role if specified
      if (userRole && userRole !== 'admin') {
        const roleVideos = allVideos.filter(
          v => v.category === userRole || v.category === 'general'
        );
        setVideos(roleVideos);
      } else {
        setVideos(allVideos);
      }
    } catch (error: any) {
      console.error('Error loading tutorial videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tutorial videos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openVideoModal = (video: TutorialVideo) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
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
      {/* Common Header */}
      <Header
        title="How to Use This Platform"
        subtitle="Learn how to use SmartMess with our comprehensive tutorial videos"
      />

      {/* Video List */}
      {videos.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Film className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No tutorial videos available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back later for new tutorial videos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card 
                key={video._id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openVideoModal(video)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge className={getCategoryColor(video.category)}>
                      {video.category}
                    </Badge>
                    {video.duration && (
                      <span className="text-sm text-muted-foreground">{video.duration}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{video.title}</CardTitle>
                  {video.description && (
                    <CardDescription className="line-clamp-2">
                      {video.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Video className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                      <div className="bg-white/90 rounded-full p-3">
                        <Play className="h-8 w-8 text-black ml-1" fill="black" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <div 
            className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
              <Button variant="ghost" size="sm" onClick={closeVideoModal}>
                Close
              </Button>
            </div>
            <div className="p-6">
              {selectedVideo.description && (
                <p className="text-muted-foreground mb-6">{selectedVideo.description}</p>
              )}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <iframe
                  src={selectedVideo.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


