import { useState, useEffect } from 'react';
import { adminTutorialVideosService, TutorialVideo, CreateTutorialVideoDto, UpdateTutorialVideoDto } from '@/services/tutorialVideosService';

export function useTutorialVideosManagement() {
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminTutorialVideosService.getAll();
      setVideos(data);
    } catch (err: any) {
      console.error('Error loading tutorial videos:', err);
      setError(err.message || 'Failed to load tutorial videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const createVideo = async (data: CreateTutorialVideoDto) => {
    try {
      const newVideo = await adminTutorialVideosService.create(data);
      setVideos([...videos, newVideo]);
      return newVideo;
    } catch (err: any) {
      console.error('Error creating tutorial video:', err);
      throw new Error(err.message || 'Failed to create tutorial video');
    }
  };

  const updateVideo = async (id: string, data: UpdateTutorialVideoDto) => {
    try {
      const updatedVideo = await adminTutorialVideosService.update(id, data);
      setVideos(videos.map(v => v._id === id ? updatedVideo : v));
      return updatedVideo;
    } catch (err: any) {
      console.error('Error updating tutorial video:', err);
      throw new Error(err.message || 'Failed to update tutorial video');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      await adminTutorialVideosService.delete(id);
      setVideos(videos.filter(v => v._id !== id));
    } catch (err: any) {
      console.error('Error deleting tutorial video:', err);
      throw new Error(err.message || 'Failed to delete tutorial video');
    }
  };

  const refreshVideos = () => {
    loadVideos();
  };

  return {
    videos,
    loading,
    error,
    createVideo,
    updateVideo,
    deleteVideo,
    refreshVideos,
  };
}


