import { io, Socket } from 'socket.io-client';
import { authService } from '@/services/authService';
import { ChatMessage, TypingUser } from '../types/chat.types';

export class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event callbacks
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;
  private onNewMessageCallback?: (message: ChatMessage) => void;
  private onUserJoinedCallback?: (data: { userId: string; roomId: string }) => void;
  private onUserLeftCallback?: (data: { userId: string; roomId: string }) => void;
  private onUserTypingCallback?: (data: TypingUser) => void;
  private onReactionUpdatedCallback?: (data: { messageId: string; reactions: any[] }) => void;
  private onMessagesReadCallback?: (data: { userId: string; roomId: string; messageIds: string[] }) => void;
  private onNotificationCallback?: (notification: any) => void;
  private onErrorCallback?: (error: { message: string }) => void;
  private onPollCreatedCallback?: (data: { poll: any }) => void;
  private onPollUpdatedCallback?: (data: { poll: any }) => void;
  private onPollDeletedCallback?: (data: { pollId: string }) => void;
  // New callback properties
  private onMessageDeletedCallback?: (data: { messageId: string; deletedMessage: any }) => void;
  private onMessageUpdatedCallback?: (data: { messageId: string; updatedMessage: any }) => void;

  constructor() {
    // Don't auto-connect in constructor to prevent infinite loops
    // Connection will be initiated when needed
  }

  // Public method to initiate connection when needed
  public initializeConnection(): void {
    if (!this.isConnected && !this.socket) {
      this.connect();
    }
  }

  private async connect(): Promise<void> {
    let token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      this.onErrorCallback?.({ message: 'No authentication token found' });
      this.handleTokenExpired();
      return;
    }

    // If token payload indicates expired, try refreshing once (if online)
    if (this.isTokenExpired(token)) {
      console.warn('WebSocketService: Token appears expired. Attempting refresh before disconnecting.');
      if (navigator.onLine) {
        try {
          await authService.refreshToken();
          token = localStorage.getItem('authToken') || null;
          if (!token) {
            // Refresh didn't return a token
            this.handleTokenExpired();
            return;
          }
        } catch (err) {
          console.warn('WebSocketService: Refresh failed:', err);
          this.handleTokenExpired();
          return;
        }
      } else {
        // If offline, treat as expired and force logout (can't refresh)
        this.handleTokenExpired();
        return;
      }
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(import.meta.env['VITE_WS_URL'] || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    this.setupEventListeners();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        return true;
      }
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  private handleTokenExpired(): void {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authExpires');
    
    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    
    // Redirect to login
    window.location.href = '/login';
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.onConnectCallback?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.isConnected = false;
      this.onDisconnectCallback?.();
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      
      // Handle specific authentication errors
      if (error.message?.includes('Token expired') || error.message?.includes('Invalid token')) {
        console.warn('WebSocket authentication error. Logging out.');
        try {
          authService.logout();
        } catch (e) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('userRole');
          localStorage.removeItem('authExpires');
        }
        window.location.href = '/login';
      }
      
      this.onErrorCallback?.({ message: 'Connection failed' });
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      this.onNewMessageCallback?.(message);
    });

    this.socket.on('user_joined', (data: { userId: string; roomId: string }) => {
      this.onUserJoinedCallback?.(data);
    });

    this.socket.on('user_left', (data: { userId: string; roomId: string }) => {
      this.onUserLeftCallback?.(data);
    });

    this.socket.on('user_typing', (data: TypingUser) => {
      this.onUserTypingCallback?.(data);
    });

    this.socket.on('reaction_updated', (data: { messageId: string; reactions: any[] }) => {
      this.onReactionUpdatedCallback?.(data);
    });

    this.socket.on('messages_read', (data: { userId: string; roomId: string; messageIds: string[] }) => {
      this.onMessagesReadCallback?.(data);
    });

    this.socket.on('notification', (notification: any) => {
      this.onNotificationCallback?.(notification);
    });

    this.socket.on('error', (error: { message: string }) => {
      this.onErrorCallback?.(error);
    });

    // Poll events
    this.socket.on('poll_created', (data: { poll: any }) => {
      this.onPollCreatedCallback?.(data);
    });

    this.socket.on('poll_updated', (data: { poll: any }) => {
      this.onPollUpdatedCallback?.(data);
    });

    this.socket.on('poll_deleted', (data: { pollId: string }) => {
      this.onPollDeletedCallback?.(data);
    });

    this.socket.on('room_joined', (data: { roomId: string }) => {
      console.log('Joined room:', data.roomId);
    });

    this.socket.on('room_left', (data: { roomId: string }) => {
      console.log('Left room:', data.roomId);
    });

    this.socket.on('message_sent', (data: { messageId: string }) => {
      console.log('Message sent:', data.messageId);
    });

    // New events for message deletion and reactions
    this.socket.on('message_deleted', (data: { messageId: string; deletedMessage: any }) => {
      // Handle message deletion
      this.onMessageDeletedCallback?.(data);
    });

    this.socket.on('message_updated', (data: { messageId: string; updatedMessage: any }) => {
      // Handle message updates (including reactions)
      this.onMessageUpdatedCallback?.(data);
    });
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Public methods
  public joinRoom(roomId: string): void {
    this.socket?.emit('join_room', { roomId });
  }

  public leaveRoom(roomId: string): void {
    this.socket?.emit('leave_room', { roomId });
  }

  public sendMessage(data: {
    roomId: string;
    content: string;
    messageType?: string;
    replyTo?: string;
    attachments?: any[];
  }): void {
    this.socket?.emit('send_message', data);
  }

  public startTyping(roomId: string): void {
    this.socket?.emit('typing_start', { roomId });
  }

  public stopTyping(roomId: string): void {
    this.socket?.emit('typing_stop', { roomId });
  }

  public addReaction(messageId: string, emoji: string, roomId: string): void {
    this.socket?.emit('add_reaction', { messageId, emoji, roomId });
  }

  public markMessagesAsRead(roomId: string, messageIds: string[]): void {
    this.socket?.emit('mark_read', { roomId, messageIds });
  }

  // New WebSocket methods
  public deleteMessage(messageId: string, roomId: string): void {
    this.socket?.emit('delete_message', { messageId, roomId });
  }

  public massDeleteMessages(messageIds: string[], roomId: string): void {
    this.socket?.emit('mass_delete_messages', { messageIds, roomId });
  }

  // Event callback setters
  public onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  public onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  public onNewMessage(callback: (message: ChatMessage) => void): void {
    this.onNewMessageCallback = callback;
  }

  public onUserJoined(callback: (data: { userId: string; roomId: string }) => void): void {
    this.onUserJoinedCallback = callback;
  }

  public onUserLeft(callback: (data: { userId: string; roomId: string }) => void): void {
    this.onUserLeftCallback = callback;
  }

  public onUserTyping(callback: (data: TypingUser) => void): void {
    this.onUserTypingCallback = callback;
  }

  public onReactionUpdated(callback: (data: { messageId: string; reactions: any[] }) => void): void {
    this.onReactionUpdatedCallback = callback;
  }

  public onMessagesRead(callback: (data: { userId: string; roomId: string; messageIds: string[] }) => void): void {
    this.onMessagesReadCallback = callback;
  }

  public onNotification(callback: (notification: any) => void): void {
    this.onNotificationCallback = callback;
  }

  public onError(callback: (error: { message: string }) => void): void {
    this.onErrorCallback = callback;
  }

  public onPollCreated(callback: (data: { poll: any }) => void): void {
    this.onPollCreatedCallback = callback;
  }

  public onPollUpdated(callback: (data: { poll: any }) => void): void {
    this.onPollUpdatedCallback = callback;
  }

  public onPollDeleted(callback: (data: { pollId: string }) => void): void {
    this.onPollDeletedCallback = callback;
  }

  // New callback setters
  public onMessageDeleted(callback: (data: { messageId: string; deletedMessage: any }) => void): void {
    this.onMessageDeletedCallback = callback;
  }

  public onMessageUpdated(callback: (data: { messageId: string; updatedMessage: any }) => void): void {
    this.onMessageUpdatedCallback = callback;
  }

  // Utility methods
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  public reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Lazy singleton instance - only create when needed
let websocketServiceInstance: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!websocketServiceInstance) {
    websocketServiceInstance = new WebSocketService();
  }
  return websocketServiceInstance;
};

// For backward compatibility, export a getter
export const websocketService = {
  get instance() {
    return getWebSocketService();
  }
};
