import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import ChatRoom from '../models/ChatRoom';
import ChatMessage from '../models/ChatMessage';
import { ChatService } from './chatService';
import logger from '../utils/logger';

interface AuthenticatedSocket {
  id: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  to: (room: string) => any;
  handshake: {
    auth: {
      token?: string;
    };
  };
  on: (event: string, callback: (...args: any[]) => void) => void;
  userId?: string;
  userRole?: string;
}

interface Socket {
  id: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  to: (room: string) => Socket;
  handshake: {
    auth: {
      token?: string;
    };
  };
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        const userId = decoded.id || decoded.userId;
        logger.info(`WebSocket auth attempt for user ID: ${userId}`);
        
        const user = await User.findById(userId).select('_id role isActive email');
        logger.info(`User found: ${user ? 'Yes' : 'No'}, isActive: ${user?.isActive}, email: ${user?.email}`);
        
        if (!user || !user.isActive) {
          logger.error(`WebSocket auth failed - User: ${user ? 'found' : 'not found'}, isActive: ${user?.isActive}`);
          return next(new Error('Authentication error: User not found or inactive'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        next();
      } catch (error: any) {
        logger.error('Socket authentication error:', error);
        if (error.name === 'TokenExpiredError') {
          next(new Error('Authentication error: Token expired. Please log in again.'));
        } else if (error.name === 'JsonWebTokenError') {
          next(new Error('Authentication error: Invalid token. Please log in again.'));
        } else {
          next(new Error('Authentication error: Invalid token'));
        }
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: any) => {
      logger.info(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId!, socket.id);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Handle joining chat rooms
      socket.on('join_room', async (data: { roomId: string }) => {
        try {
          const { hasPermission } = await ChatService.checkRoomPermission(
            socket.userId!, 
            data.roomId, 
            'read'
          );

          if (hasPermission) {
            socket.join(`room_${data.roomId}`);
            socket.emit('room_joined', { roomId: data.roomId });
            
            // Notify others in the room
            socket.to(`room_${data.roomId}`).emit('user_joined', {
              userId: socket.userId,
              roomId: data.roomId
            });
          } else {
            socket.emit('error', { message: 'No permission to join this room' });
          }
        } catch (error) {
          logger.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle leaving chat rooms
      socket.on('leave_room', (data: { roomId: string }) => {
        socket.leave(`room_${data.roomId}`);
        socket.emit('room_left', { roomId: data.roomId });
        
        // Notify others in the room
        socket.to(`room_${data.roomId}`).emit('user_left', {
          userId: socket.userId,
          roomId: data.roomId
        });
      });

      // Handle sending messages
      socket.on('send_message', async (data: {
        roomId: string;
        content: string;
        messageType?: string;
        replyTo?: string;
        attachments?: any[];
      }) => {
        try {
          const { hasPermission } = await ChatService.checkRoomPermission(
            socket.userId!, 
            data.roomId, 
            'write'
          );

          if (!hasPermission) {
            socket.emit('error', { message: 'No permission to send message' });
            return;
          }

          const messageData: any = {
            roomId: data.roomId,
            content: data.content,
            messageType: (data.messageType || 'text') as 'text' | 'image' | 'file' | 'system',
            replyTo: data.replyTo,
            attachments: data.attachments
          };

          const message = await ChatService.sendMessage(socket.userId!, messageData);
          
          // Broadcast message to all users in the room
          this.io.to(`room_${data.roomId}`).emit('new_message', message);
          
          // Send confirmation to sender
          socket.emit('message_sent', { messageId: message._id });
        } catch (error: any) {
          logger.error('Error sending message:', error);
          logger.error('Error details:', {
            message: error.message,
            stack: error.stack,
            data: JSON.stringify(data, null, 2)
          });
          socket.emit('error', { 
            message: error.message || 'Failed to send message',
            details: error.message
          });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { roomId: string }) => {
        socket.to(`room_${data.roomId}`).emit('user_typing', {
          userId: socket.userId,
          roomId: data.roomId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data: { roomId: string }) => {
        socket.to(`room_${data.roomId}`).emit('user_typing', {
          userId: socket.userId,
          roomId: data.roomId,
          isTyping: false
        });
      });

      // Handle message reactions
      socket.on('add_reaction', async (data: {
        messageId: string;
        emoji: string;
        roomId: string;
      }) => {
        try {
          // Verify socket.userId is set
          if (!socket.userId) {
            socket.emit('error', { message: 'Authentication error: User ID not found' });
            logger.error('add_reaction: socket.userId is not set');
            return;
          }

          const userId = socket.userId.toString();
          logger.info(`Adding reaction: userId=${userId}, messageId=${data.messageId}, emoji=${data.emoji}`);

          const message = await ChatMessage.findById(data.messageId);
          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          // Check if user already reacted with this specific emoji
          const existingReactionWithSameEmoji = message.reactions.find(
            r => r.userId.toString() === userId && r.emoji === data.emoji
          );

          if (existingReactionWithSameEmoji) {
            // User clicked the same emoji again - remove it (toggle off)
            message.reactions = message.reactions.filter(
              r => !(r.userId.toString() === userId && r.emoji === data.emoji)
            );
            logger.info(`Removed reaction: userId=${userId}, emoji=${data.emoji}`);
          } else {
            // Remove any existing reaction from this user (user can only have one reaction at a time)
            const previousReactionCount = message.reactions.filter(
              r => r.userId.toString() === userId
            ).length;
            
            message.reactions = message.reactions.filter(
              r => r.userId.toString() !== userId
            );
            
            // Add the new reaction
            message.reactions.push({
              userId: new mongoose.Types.ObjectId(userId),
              emoji: data.emoji,
              addedAt: new Date()
            });
            
            if (previousReactionCount > 0) {
              logger.info(`Replaced reaction: userId=${userId}, new emoji=${data.emoji}`);
            } else {
              logger.info(`Added reaction: userId=${userId}, emoji=${data.emoji}`);
            }
          }

          await message.save();

          // Format reactions for broadcast (ensure userId is string)
          const formattedReactions = message.reactions.map((r: any) => ({
            userId: r.userId.toString(),
            emoji: r.emoji,
            addedAt: r.addedAt
          }));

          // Broadcast reaction update
          this.io.to(`room_${data.roomId}`).emit('reaction_updated', {
            messageId: data.messageId,
            reactions: formattedReactions
          });
        } catch (error) {
          logger.error('Error adding reaction:', error);
          socket.emit('error', { message: 'Failed to add reaction' });
        }
      });

      // Handle message read status
      socket.on('mark_read', async (data: { roomId: string; messageIds: string[] }) => {
        try {
          await ChatService.markMessagesAsRead(socket.userId!, data.roomId, data.messageIds);
          
          // Broadcast read status to other users
          socket.to(`room_${data.roomId}`).emit('messages_read', {
            userId: socket.userId,
            roomId: data.roomId,
            messageIds: data.messageIds
          });
        } catch (error) {
          logger.error('Error marking messages as read:', error);
          socket.emit('error', { message: 'Failed to mark messages as read' });
        }
      });

      // Handle poll updates
      socket.on('poll_updated', (data: { roomId: string; poll: any }) => {
        // Broadcast poll update to all users in the room
        socket.to(`room_${data.roomId}`).emit('poll_updated', {
          poll: data.poll
        });
      });

      // Handle poll creation
      socket.on('poll_created', (data: { roomId: string; poll: any }) => {
        // Broadcast new poll to all users in the room
        socket.to(`room_${data.roomId}`).emit('poll_created', {
          poll: data.poll
        });
      });

      // Handle poll deletion
      socket.on('poll_deleted', (data: { roomId: string; pollId: string }) => {
        // Broadcast poll deletion to all users in the room
        socket.to(`room_${data.roomId}`).emit('poll_deleted', {
          pollId: data.pollId
        });
      });

      // Handle message deletion
      socket.on('delete_message', async (data: {
        messageId: string;
        roomId: string;
      }) => {
        try {
          const deletedMessage = await ChatService.deleteMessage(socket.userId!, data.messageId);
          
          // Broadcast message deletion to all users in the room
          this.io.to(`room_${data.roomId}`).emit('message_deleted', {
            messageId: data.messageId,
            deletedMessage
          });
        } catch (error) {
          logger.error('Error deleting message:', error);
          socket.emit('error', { message: 'Failed to delete message' });
        }
      });

      // Handle mass message deletion
      socket.on('mass_delete_messages', async (data: {
        messageIds: string[];
        roomId: string;
      }) => {
        try {
          const deletedCount = await ChatService.massDeleteMessages(socket.userId!, data.messageIds);
          
          // Broadcast mass deletion to all users in the room
          this.io.to(`room_${data.roomId}`).emit('mass_messages_deleted', {
            messageIds: data.messageIds,
            deletedCount
          });
        } catch (error) {
          logger.error('Error mass deleting messages:', error);
          socket.emit('error', { message: 'Failed to delete messages' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId!);
      });
    });
  }

  /**
   * Send notification to a specific user
   */
  public sendNotificationToUser(userId: string, notification: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  /**
   * Send notification to all users in a room
   */
  public sendNotificationToRoom(roomId: string, notification: any): void {
    this.io.to(`room_${roomId}`).emit('room_notification', notification);
  }

  /**
   * Broadcast poll update to all users in a room
   */
  public broadcastPollUpdate(roomId: string, poll: any): void {
    this.io.to(`room_${roomId}`).emit('poll_updated', { poll });
  }

  /**
   * Broadcast new poll to all users in a room
   */
  public broadcastPollCreated(roomId: string, poll: any): void {
    this.io.to(`room_${roomId}`).emit('poll_created', { poll });
  }

  /**
   * Broadcast poll deletion to all users in a room
   */
  public broadcastPollDeleted(roomId: string, pollId: string): void {
    this.io.to(`room_${roomId}`).emit('poll_deleted', { pollId });
  }

  /**
   * Broadcast message deletion to all users in a room
   */
  public broadcastMessageDeleted(roomId: string, messageId: string, deletedMessage: any): void {
    this.io.to(`room_${roomId}`).emit('message_deleted', { messageId, deletedMessage });
  }

  /**
   * Broadcast message update to all users in a room
   */
  public broadcastMessageUpdated(roomId: string, messageId: string, updatedMessage: any): void {
    this.io.to(`room_${roomId}`).emit('message_updated', { messageId, updatedMessage });
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get online users in a room
   */
  public async getOnlineUsersInRoom(roomId: string): Promise<string[]> {
    const room = await this.io.in(`room_${roomId}`).fetchSockets();
    return room.map((socket: any) => socket.userId).filter(Boolean);
  }
}

export default WebSocketService;
