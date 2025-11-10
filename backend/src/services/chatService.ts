import ChatRoom from '../models/ChatRoom';
import ChatMessage from '../models/ChatMessage';
import ChatNotification from '../models/ChatNotification';
import User from '../models/User';
import MessProfile from '../models/MessProfile';
import MessMembership from '../models/MessMembership';
import mongoose from 'mongoose';

// Use ChatMessage as Message for backward compatibility
const Message = ChatMessage;

export interface ChatPermission {
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
  canInvite: boolean;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  type: 'mess' | 'direct' | 'admin' | 'individual';
  messId?: string;
  participantIds: string[];
  individualWithUserId?: string;
}

export interface SendMessageData {
  roomId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  replyTo?: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
}

export interface UpdateRoomSettingsData {
  disappearingMessagesDays?: number | null;
  name?: string;
  description?: string;
}

export class ChatService {
  /**
   * Check if user has permission to access a chat room
   */
  static async checkRoomPermission(
    userId: string, 
    roomId: string, 
    action: 'read' | 'write' | 'manage' | 'invite'
  ): Promise<{ hasPermission: boolean; room?: any; userRole?: string }> {
    try {
      const room = await ChatRoom.findById(roomId).populate('participants.userId', 'role');
      if (!room || !room.isActive) {
        return { hasPermission: false };
      }

      const user = await User.findById(userId);
      if (!user) {
        return { hasPermission: false };
      }

      // Admin can access all rooms
      if (user.role === 'admin') {
        return { hasPermission: true, room, userRole: 'admin' };
      }

  // Normalize userId to string for robust comparison
  const normalizedUserId = String(userId);

      // Check if user is a participant. Participants' userId may be ObjectId or populated doc
      const participant = room.participants.find((p: any) => {
        try {
          if (!p.userId) return false;
          // If populated, p.userId may be a doc with _id
          const pid = (p.userId && (p.userId._id ? p.userId._id : p.userId));
          const pidStr = pid && pid.toString ? pid.toString() : String(pid);
          return pidStr === normalizedUserId;
        } catch (e) {
          return false;
        }
      });

      if (!participant || !participant.isActive) {
        return { hasPermission: false };
      }

      // Check role-based permissions
      const permissions = this.getRolePermissions(participant.role, room.type);
      
      switch (action) {
        case 'read':
          return { hasPermission: permissions.canRead, room, userRole: participant.role };
        case 'write':
          return { hasPermission: permissions.canWrite, room, userRole: participant.role };
        case 'manage':
          return { hasPermission: permissions.canManage, room, userRole: participant.role };
        case 'invite':
          return { hasPermission: permissions.canInvite, room, userRole: participant.role };
        default:
          return { hasPermission: false };
      }
    } catch (error) {
      console.error('Error checking room permission:', error);
      return { hasPermission: false };
    }
  }

  /**
   * Get permissions for a role in a room type
   */
  static getRolePermissions(role: string, roomType: string): ChatPermission {
    const permissions: { [key: string]: ChatPermission } = {
      'admin': {
        canRead: true,
        canWrite: true,
        canManage: true,
        canInvite: true
      },
      'mess-owner': {
        canRead: true,
        canWrite: true,
        canManage: roomType === 'mess',
        canInvite: roomType === 'mess'
      },
      'user': {
        canRead: true,
        canWrite: true,
        canManage: false,
        canInvite: false
      }
    };

    return permissions[role] || {
      canRead: false,
      canWrite: false,
      canManage: false,
      canInvite: false
    };
  }

  /**
   * Create a new chat room
   */
  static async createRoom(userId: string, roomData: CreateRoomData): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Ensure creator is included in participants
      const participantIds = Array.isArray(roomData.participantIds) ? roomData.participantIds : [];
      const combinedParticipantIds = [...new Set([userId, ...participantIds])];

      // Validate participants based on role and mess association
      const validatedParticipants = await this.validateParticipants(
        userId,
        combinedParticipantIds,
        roomData.type,
        roomData.messId
      );

      const room = new ChatRoom({
        ...roomData,
        participants: validatedParticipants,
        createdBy: userId
      });

      await room.save();
      return await this.getRoomDetails(room._id.toString());
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Validate participants based on role and mess association
   */
  static async validateParticipants(
    creatorId: string, 
    participantIds: string[], 
    roomType: string, 
    messId?: string
  ): Promise<any[]> {
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const participants = [];
    const uniqueIds = [...new Set(participantIds)]; // Remove duplicates

    for (const participantId of uniqueIds) {
      const participant = await User.findById(participantId);
      if (!participant) {
        continue; // Skip invalid users
      }

      // Add creator if not already in list
      if (participantId === creatorId) {
        participants.push({
          userId: participantId,
          role: creator.role,
          joinedAt: new Date(),
          isActive: true
        });
        continue;
      }

      // Validate based on room type and creator role
      if (roomType === 'mess' && messId) {
        // For mess rooms, check if participant is associated with the mess
        const membership = await MessMembership.findOne({
          userId: participantId,
          messId: messId,
          status: 'active'
        });
        
        if (membership || participant.role === 'admin') {
          participants.push({
            userId: participantId,
            role: participant.role,
            joinedAt: new Date(),
            isActive: true
          });
        }
      } else if (roomType === 'direct') {
        // For direct messages, check if users can communicate
        if (await this.canUsersCommunicate(creatorId, participantId)) {
          participants.push({
            userId: participantId,
            role: participant.role,
            joinedAt: new Date(),
            isActive: true
          });
        }
      } else if (roomType === 'admin') {
        // Only admins can be in admin rooms
        if (participant.role === 'admin') {
          participants.push({
            userId: participantId,
            role: participant.role,
            joinedAt: new Date(),
            isActive: true
          });
        }
      } else if (roomType === 'individual') {
        // For individual chats, check if users can communicate
        if (await this.canUsersCommunicate(creatorId, participantId)) {
          participants.push({
            userId: participantId,
            role: participant.role,
            joinedAt: new Date(),
            isActive: true
          });
        }
      }
    }

    return participants;
  }

  /**
   * Check if two users can communicate directly
   */
  static async canUsersCommunicate(userId1: string, userId2: string): Promise<boolean> {
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);
    
    if (!user1 || !user2) return false;

    // Admins can communicate with anyone
    if (user1.role === 'admin' || user2.role === 'admin') {
      return true;
    }

    // For now, allow mess owners to communicate with any user
    // This is a temporary solution for testing
    if (user1.role === 'mess-owner' || user2.role === 'mess-owner') {
      console.log('Allowing communication between mess owner and user for testing');
      return true;
    }

    // Check if users are in the same mess
    if (user1.messId && user2.messId && user1.messId.toString() === user2.messId.toString()) {
      return true;
    }

    return false;
  }

  /**
   * Create individual chat between mess owner and user
   */
  static async createIndividualChatForAdmin(userId: string, targetUserId: string): Promise<any> {
    try {
      // Create individual chat for admin
      const admin = await User.findById(userId);
      const targetUser = await User.findById(targetUserId);
      
      if (!admin || !targetUser) {
        throw new Error('User not found');
      }

      if (admin.role !== 'admin') {
        throw new Error('Only admins can create individual chats');
      }

      // Check if chat already exists
      const existingChat = await ChatRoom.findOne({
        type: 'individual',
        participants: { $all: [userId, targetUserId] }
      });

      if (existingChat) {
        return existingChat;
      }

      // Create new individual chat
      const chatRoom = new ChatRoom({
        name: `Admin - ${targetUser.firstName || targetUser.email || 'User'}`,
        type: 'individual',
        participants: [userId, targetUserId],
        createdBy: userId,
        isActive: true
      });

      await chatRoom.save();
      return chatRoom;
    } catch (error) {
      console.error('Error creating individual chat for admin:', error);
      throw error;
    }
  }

  static async createIndividualChat(messOwnerId: string, userId: string): Promise<any> {
    try {
      // Check if mess owner has permission to message this user
      const messOwner = await User.findById(messOwnerId);
      const targetUser = await User.findById(userId);
      
      if (!messOwner || !targetUser) {
        throw new Error('User not found');
      }

      if (messOwner.role !== 'mess-owner') {
        throw new Error('Only mess owners can create individual chats');
      }

      // Check if mess owner can communicate with this user
      console.log('Checking communication between:', {
        messOwnerId,
        userId,
        messOwnerRole: messOwner.role,
        targetUserRole: targetUser.role,
        messOwnerMessId: messOwner.messId,
        targetUserMessId: targetUser.messId
      });
      
      const canCommunicate = await this.canUsersCommunicate(messOwnerId, userId);
      console.log('Can communicate:', canCommunicate);
      
      if (!canCommunicate) {
        throw new Error('Mess owner cannot communicate with this user');
      }

      // Check if individual chat already exists
      const existingChat = await ChatRoom.findOne({
        type: 'individual',
        'participants.userId': { $all: [messOwnerId, userId] },
        isActive: true
      }).populate('participants.userId', 'firstName lastName email profilePicture role');

      if (existingChat) {
        return existingChat;
      }

      // Create new individual chat
      const room = new ChatRoom({
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        description: `Individual conversation between ${messOwner.firstName} and ${targetUser.firstName}`,
        type: 'individual',
        individualWith: userId,
        participants: [
          {
            userId: messOwnerId,
            role: messOwner.role,
            joinedAt: new Date(),
            isActive: true
          },
          {
            userId: userId,
            role: targetUser.role,
            joinedAt: new Date(),
            isActive: true
          }
        ],
        createdBy: messOwnerId,
        isActive: true,
        settings: {
          allowFileUpload: true,
          allowImageUpload: true,
          maxFileSize: 10,
          messageRetentionDays: 90
        }
      });

      await room.save();
      
      // Populate the room with user details
      const populatedRoom = await ChatRoom.findById(room._id)
        .populate('participants.userId', 'firstName lastName email profilePicture role')
        .populate('individualWith', 'firstName lastName email profilePicture role')
        .populate('createdBy', 'firstName lastName email profilePicture role');

      return populatedRoom;
    } catch (error) {
      console.error('Error creating individual chat:', error);
      throw error;
    }
  }

  /**
   * Get user's accessible rooms
   * Filters out mess-related rooms if user doesn't have active membership
   * Mess owners can see all rooms for their messes
   */
  static async getUserRooms(userId: string): Promise<any[]> {
    try {
      // Get user to check their role
      const user = await User.findById(userId).select('role').lean();
      const isMessOwner = user?.role === 'mess-owner';
      const isAdmin = user?.role === 'admin';

      // Get user's active mess memberships to verify access to mess-related rooms
      const activeMemberships = await MessMembership.find({
        userId: userId,
        status: { $in: ['active', 'pending'] }
      }).select('messId').lean();

      const activeMessIds = new Set(
        activeMemberships.map(m => m.messId?.toString()).filter(Boolean)
      );

      // If user is a mess owner, get all messes they own
      let ownedMessIds = new Set<string>();
      if (isMessOwner) {
        const ownedMesses = await MessProfile.find({ userId: userId }).select('_id').lean();
        ownedMessIds = new Set(
          ownedMesses.map(m => m._id.toString()).filter(Boolean)
        );
      }

      // Build query: rooms where user is participant OR (if mess owner) rooms for their messes
      const roomQuery: any = {
        isActive: true
      };

      if (isMessOwner && ownedMessIds.size > 0) {
        // Mess owners: get rooms where they're participants OR rooms for their messes
        roomQuery.$or = [
          { 'participants.userId': userId, 'participants.isActive': true },
          { 
            messId: { $in: Array.from(ownedMessIds).map(id => new mongoose.Types.ObjectId(id)) },
            type: { $in: ['mess', 'mess-group', 'announcements', 'meal-discussions'] }
          }
        ];
      } else {
        // Regular users: only rooms where they're participants
        roomQuery['participants.userId'] = userId;
        roomQuery['participants.isActive'] = true;
      }

      // Get rooms
      const rooms = await ChatRoom.find(roomQuery)
        .populate('participants.userId', 'firstName lastName email profilePicture role')
        .populate('messId', 'name')
        .sort({ updatedAt: -1 });

      // If user is admin, they can see all rooms (no filtering needed)
      if (isAdmin) {
        return rooms.map(room => this.formatRoomForUser(room, userId));
      }

      // Filter rooms: only show mess-related rooms if user has active membership OR owns the mess
      const filteredRooms = rooms.filter(room => {
        // If room is not mess-related (direct, admin, individual), always show
        if (!room.messId || !['mess', 'mess-group', 'announcements', 'meal-discussions'].includes(room.type)) {
          return true;
        }
        
        // For mess-related rooms, check if user has active membership OR owns the mess
        const messIdStr = room.messId._id?.toString() || room.messId.toString();
        return activeMessIds.has(messIdStr) || ownedMessIds.has(messIdStr);
      });

      return filteredRooms.map(room => this.formatRoomForUser(room, userId));
    } catch (error) {
      console.error('Error getting user rooms:', error);
      throw error;
    }
  }

  /**
   * Get room details
   */
  static async getRoomDetails(roomId: string): Promise<any> {
    try {
      const room = await ChatRoom.findById(roomId)
        .populate('participants.userId', 'firstName lastName email profilePicture role')
        .populate('messId', 'name')
        .populate('createdBy', 'firstName lastName email profilePicture role');

      if (!room) {
        throw new Error('Room not found');
      }

      return room;
    } catch (error) {
      console.error('Error getting room details:', error);
      throw error;
    }
  }

  /**
   * Send a message to a room
   */
  static async sendMessage(userId: string, messageData: SendMessageData): Promise<any> {
    try {
      // Check permission
      const { hasPermission } = await this.checkRoomPermission(userId, messageData.roomId, 'write');
      if (!hasPermission) {
        throw new Error('No permission to send message');
      }

      // Ensure content is not empty for non-image/file messages
      if (!messageData.content && messageData.messageType === 'text') {
        throw new Error('Message content cannot be empty');
      }

      // For image/file messages, allow empty content but ensure attachments exist
      if ((messageData.messageType === 'image' || messageData.messageType === 'file') && 
          (!messageData.attachments || messageData.attachments.length === 0)) {
        throw new Error('Attachments are required for image/file messages');
      }

      const message = new ChatMessage({
        ...messageData,
        content: messageData.content || '', // Ensure content is always a string
        senderId: userId,
        readBy: [{ userId, readAt: new Date() }]
      });

      await message.save();

      // Update room's updatedAt
      await ChatRoom.findByIdAndUpdate(messageData.roomId, { updatedAt: new Date() });

      // Create notifications for other participants
      await this.createMessageNotifications(message);

      return await this.getMessageDetails(message._id.toString());
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a room
   */
  static async getRoomMessages(
    userId: string, 
    roomId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<any> {
    try {
      // Check permission
      const { hasPermission } = await this.checkRoomPermission(userId, roomId, 'read');
      if (!hasPermission) {
        throw new Error('No permission to read messages');
      }

      const skip = (page - 1) * limit;
      
      const messages = await ChatMessage.find({
        roomId,
        isDeleted: false
      })
      .populate('senderId', 'firstName lastName email profilePicture role')
      .populate('replyTo', 'content senderId')
      .populate('replyTo.senderId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      // Mark messages as read
      await this.markMessagesAsRead(userId, roomId, messages.map(m => m._id.toString()));

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting room messages:', error);
      throw error;
    }
  }

  /**
   * Create notifications for message recipients
   */
  static async createMessageNotifications(message: any): Promise<void> {
    try {
      const room = await ChatRoom.findById(message.roomId);
      if (!room) return;

      const otherParticipants = room.participants.filter(
        p => p.userId.toString() !== message.senderId.toString() && p.isActive
      );

      for (const participant of otherParticipants) {
        const notification = new ChatNotification({
          userId: participant.userId,
          roomId: message.roomId,
          messageId: message._id,
          type: 'new_message',
          title: 'New Message',
          content: message.content.substring(0, 100),
          priority: 'medium',
          metadata: {
            senderId: message.senderId,
            roomName: room.name
          }
        });

        await notification.save();
      }
    } catch (error) {
      console.error('Error creating message notifications:', error);
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(userId: string, roomId: string, messageIds: string[]): Promise<void> {
    try {
      await ChatMessage.updateMany(
        {
          _id: { $in: messageIds },
          roomId,
          'readBy.userId': { $ne: userId }
        },
        {
          $push: {
            readBy: {
              userId,
              readAt: new Date()
            }
          }
        }
      );

      // Mark notifications as read
      await ChatNotification.updateMany(
        {
          userId,
          roomId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Format room data for user
   */
  static formatRoomForUser(room: any, userId: string): any {
  const normalizedUserId = String(userId);
    const participant = room.participants.find((p: any) => {
      if (!p.userId) return false;
      const pid = (p.userId && (p.userId._id ? p.userId._id : p.userId));
      const pidStr = pid && pid.toString ? pid.toString() : String(pid);
      return pidStr === normalizedUserId;
    });

    return {
      ...room.toObject(),
      userRole: participant?.role,
      lastSeen: participant?.lastSeen
    };
  }

  /**
   * Get message details
   */
  static async getMessageDetails(messageId: string): Promise<any> {
    try {
      return await ChatMessage.findById(messageId)
        .populate('senderId', 'firstName lastName email profilePicture role')
        .populate('replyTo', 'content senderId')
        .populate('replyTo.senderId', 'firstName lastName');
    } catch (error) {
      console.error('Error getting message details:', error);
      throw error;
    }
  }

  /**
   * Delete a chat room
   */
  static async deleteRoom(roomId: string): Promise<void> {
    try {
      // Delete all messages in the room
      await ChatMessage.deleteMany({ roomId });
      
      // Delete the room
      await ChatRoom.findByIdAndDelete(roomId);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(userId: string, messageId: string): Promise<any> {
    try {
      const message = await Message.findOneAndUpdate(
        { _id: messageId, senderId: userId },
        { 
          content: '[Message deleted]',
          isDeleted: true,
          deletedAt: new Date()
        },
        { new: true }
      );

      if (!message) {
        throw new Error('Message not found or unauthorized');
      }

      return message;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Add reaction to a message
   */
  static async addReaction(userId: string, messageId: string, emoji: string): Promise<any> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user already reacted with this specific emoji
      const existingReactionWithSameEmoji = message.reactions.find(
        (r: any) => r.userId.toString() === userId && r.emoji === emoji
      );

      if (existingReactionWithSameEmoji) {
        // User clicked the same emoji again - remove it (toggle off)
        message.reactions = message.reactions.filter(
          (r: any) => !(r.userId.toString() === userId && r.emoji === emoji)
        );
      } else {
        // Remove any existing reaction from this user (user can only have one reaction at a time)
        message.reactions = message.reactions.filter(
          (r: any) => r.userId.toString() !== userId
        );
        
        // Add the new reaction
        message.reactions.push({
          userId: new mongoose.Types.ObjectId(userId),
          emoji,
          addedAt: new Date()
        });
      }

      await message.save();
      return message;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Mass delete messages
   */
  static async massDeleteMessages(userId: string, messageIds: string[]): Promise<number> {
    try {
      const result = await Message.updateMany(
        { _id: { $in: messageIds }, senderId: userId },
        { 
          content: '[Message deleted]',
          isDeleted: true,
          deletedAt: new Date()
        }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error('Error mass deleting messages:', error);
      throw error;
    }
  }

  /**
   * Update room settings (only mess owners)
   */
  static async updateRoomSettings(roomId: string, userId: string, settings: UpdateRoomSettingsData): Promise<any> {
    try {
      const updateData: any = {};
      
      if (settings.disappearingMessagesDays !== undefined) {
        updateData.disappearingMessagesDays = settings.disappearingMessagesDays;
      }

      if (settings.name !== undefined) {
        updateData.name = settings.name.trim();
      }

      if (settings.description !== undefined) {
        updateData.description = settings.description.trim() || null;
      }

      const updatedRoom = await ChatRoom.findByIdAndUpdate(
        roomId,
        { $set: updateData },
        { new: true }
      ).populate('createdBy', 'firstName lastName email profilePicture role')
        .populate('participants.userId', 'firstName lastName email profilePicture role')
        .populate('messId', 'name location')
        .populate('individualWith', 'firstName lastName email profilePicture role');

      if (!updatedRoom) {
        throw new Error('Room not found');
      }

      // Return the room formatted for the user
      return this.formatRoomForUser(updatedRoom, userId);
    } catch (error) {
      console.error('Error updating room settings:', error);
      throw error;
    }
  }
}
