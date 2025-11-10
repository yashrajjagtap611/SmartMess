import apiClient from './api';

export interface TutorialVideo {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  category: 'user' | 'mess-owner' | 'general';
  order: number;
  thumbnailUrl?: string;
  duration?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateTutorialVideoDto {
  title: string;
  description?: string;
  videoUrl: string;
  category: 'user' | 'mess-owner' | 'general';
  order?: number;
  thumbnailUrl?: string;
  duration?: string;
  isActive?: boolean;
}

export interface UpdateTutorialVideoDto extends Partial<CreateTutorialVideoDto> {}

// Public endpoints (no auth required)
export const tutorialVideosService = {
  // Get all active tutorial videos
  getAll: async (): Promise<TutorialVideo[]> => {
    const response = await apiClient.get('/tutorial-videos');
    return response.data.data;
  },

  // Get videos by category
  getByCategory: async (category: 'user' | 'mess-owner' | 'general'): Promise<TutorialVideo[]> => {
    const response = await apiClient.get(`/tutorial-videos/category/${category}`);
    return response.data.data;
  },

  // Get single tutorial video
  getById: async (id: string): Promise<TutorialVideo> => {
    const response = await apiClient.get(`/tutorial-videos/${id}`);
    return response.data.data;
  },
};

// Admin endpoints (auth required)
export const adminTutorialVideosService = {
  // Get all tutorial videos (including inactive)
  getAll: async (): Promise<TutorialVideo[]> => {
    const response = await apiClient.get('/admin/tutorial-videos');
    return response.data.data;
  },

  // Get single tutorial video
  getById: async (id: string): Promise<TutorialVideo> => {
    const response = await apiClient.get(`/admin/tutorial-videos/${id}`);
    return response.data.data;
  },

  // Create tutorial video
  create: async (data: CreateTutorialVideoDto): Promise<TutorialVideo> => {
    const response = await apiClient.post('/admin/tutorial-videos', data);
    return response.data.data;
  },

  // Update tutorial video
  update: async (id: string, data: UpdateTutorialVideoDto): Promise<TutorialVideo> => {
    const response = await apiClient.put(`/admin/tutorial-videos/${id}`, data);
    return response.data.data;
  },

  // Delete tutorial video
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/tutorial-videos/${id}`);
  },
};

