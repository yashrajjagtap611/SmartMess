import apiClient from '../../../services/api';
import {
  ChatRoom,
  ChatMessage,
  ChatNotification,
  MessMember,
  CreateRoomData,
  SendMessageData,
  Poll,
  CreatePollData
} from '../types/chat.types';

export class ChatService {
  private static baseUrl = '/chat';

  // Room management
  static async getRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get(`${this.baseUrl}/rooms`);
    return response.data.data;
  }

  static async createRoom(data: CreateRoomData): Promise<ChatRoom> {
    const response = await apiClient.post(`${this.baseUrl}/rooms`, data);
    return response.data.data;
  }

  static async createIndividualChat(userId: string): Promise<ChatRoom> {
    const response = await apiClient.post(`${this.baseUrl}/individual-chat/${userId}`);
    return response.data.data;
  }

  static async deleteRoom(roomId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/rooms/${roomId}`);
  }

  static async getRoomDetails(roomId: string): Promise<ChatRoom> {
    const response = await apiClient.get(`${this.baseUrl}/rooms/${roomId}`);
    return response.data.data;
  }

  static async updateRoomSettings(roomId: string, settings: { 
    disappearingMessagesDays?: number | null;
    name?: string;
    description?: string;
  }): Promise<ChatRoom> {
    const response = await apiClient.put(`${this.baseUrl}/rooms/${roomId}/settings`, settings);
    return response.data.data;
  }

  // Message management
  static async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    const response = await apiClient.post(`${this.baseUrl}/messages`, data);
    return response.data.data;
  }

  static async getRoomMessages(
    roomId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<ChatMessage[]> {
    const response = await apiClient.get(
      `${this.baseUrl}/rooms/${roomId}/messages?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  static async markMessagesAsRead(roomId: string, messageIds: string[]): Promise<void> {
    await apiClient.post(`${this.baseUrl}/rooms/${roomId}/messages/read`, {
      messageIds
    });
  }

  // New message methods
  static async deleteMessage(messageId: string): Promise<ChatMessage> {
    const response = await apiClient.delete(`${this.baseUrl}/messages/${messageId}`);
    return response.data.data;
  }

  static async addReaction(messageId: string, emoji: string): Promise<ChatMessage> {
    const response = await apiClient.post(`${this.baseUrl}/messages/${messageId}/reaction`, {
      emoji
    });
    return response.data.data;
  }

  static async massDeleteMessages(messageIds: string[]): Promise<number> {
    const response = await apiClient.post(`${this.baseUrl}/messages/mass-delete`, {
      messageIds
    });
    return response.data.data.deletedCount;
  }

  // Notification management
  static async getNotifications(
    page: number = 1, 
    limit: number = 20, 
    unreadOnly: boolean = false
  ): Promise<{ notifications: ChatNotification[]; pagination: any }> {
    const response = await apiClient.get(
      `${this.baseUrl}/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
    );
    return {
      notifications: response.data.data,
      pagination: response.data.pagination
    };
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/notifications/${notificationId}/read`);
  }

  // Utility functions
  static async getMessMembers(): Promise<MessMember[]> {
    const response = await apiClient.get(`${this.baseUrl}/mess-members`);
    return response.data.data;
  }

  static async checkCommunicationPermission(targetUserId: string): Promise<boolean> {
    const response = await apiClient.get(
      `${this.baseUrl}/communication-permission/${targetUserId}`
    );
    return response.data.data.canCommunicate;
  }

  // File upload
  static async uploadFile(file: File): Promise<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${this.baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  // Poll management
  static async createPoll(roomId: string, pollData: CreatePollData): Promise<Poll> {
    const response = await apiClient.post('/polls', {
      ...pollData,
      roomId
    });
    return response.data.data;
  }

  static async getRoomPolls(roomId: string): Promise<Poll[]> {
    const response = await apiClient.get(`/polls/room/${roomId}`);
    return response.data.data;
  }

  static async voteOnPoll(pollId: string, optionId: string): Promise<Poll> {
    const response = await apiClient.post(`/polls/${pollId}/vote`, {
      optionId
    });
    return response.data.data;
  }

  static async closePoll(pollId: string): Promise<Poll> {
    const response = await apiClient.patch(`/polls/${pollId}/close`);
    return response.data.data;
  }

  static async updatePoll(pollId: string, pollData: CreatePollData): Promise<Poll> {
    const response = await apiClient.put(`/polls/${pollId}`, pollData);
    return response.data.data;
  }

  static async deletePoll(pollId: string): Promise<void> {
    await apiClient.delete(`/polls/${pollId}`);
  }
}