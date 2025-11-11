"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chatService_1 = require("../services/chatService");
const ChatNotification_1 = __importDefault(require("../models/ChatNotification"));
const User_1 = __importDefault(require("../models/User"));
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const MessMembership_1 = __importDefault(require("../models/MessMembership"));
const logger_1 = __importDefault(require("../utils/logger"));
class ChatController {
    /**
     * Get user's chat rooms
     */
    static async getUserRooms(req, res, next) {
        try {
            const userId = req.user._id;
            const rooms = await chatService_1.ChatService.getUserRooms(userId);
            res.status(200).json({
                success: true,
                data: rooms,
                message: 'Rooms retrieved successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error getting user rooms:', error);
            next(error);
        }
    }
    /**
     * Create individual chat between mess owner/admin and user
     */
    static async createIndividualChat(req, res, next) {
        try {
            const userId = req.user._id;
            const { userId: targetUserId } = req.params;
            if (!targetUserId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            // Get the current user to check their role
            const currentUser = await User_1.default.findById(userId);
            if (!currentUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            // Allow admins and mess owners to create individual chats
            if (currentUser.role !== 'admin' && currentUser.role !== 'mess-owner') {
                res.status(403).json({
                    success: false,
                    message: 'Only admins and mess owners can create individual chats'
                });
                return;
            }
            // If user is an admin, they can chat with anyone
            // If user is a mess owner, use the existing logic
            let room;
            if (currentUser.role === 'admin') {
                room = await chatService_1.ChatService.createIndividualChatForAdmin(userId, targetUserId);
            }
            else {
                room = await chatService_1.ChatService.createIndividualChat(userId, targetUserId);
            }
            res.status(201).json({
                success: true,
                data: room,
                message: 'Individual chat created successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error creating individual chat:', error);
            next(error);
        }
    }
    /**
     * Create a new chat room
     */
    static async createRoom(req, res, next) {
        try {
            const userId = req.user._id;
            const { name, description, type, messId, participantIds } = req.body;
            // Validate required fields
            if (!name || !type || !participantIds || !Array.isArray(participantIds)) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: name, type, participantIds'
                });
                return;
            }
            // Validate room type
            if (!['mess', 'direct', 'admin', 'individual'].includes(type)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid room type. Must be mess, direct, admin, or individual'
                });
                return;
            }
            // For mess rooms, messId is required
            if (type === 'mess' && !messId) {
                res.status(400).json({
                    success: false,
                    message: 'messId is required for mess rooms'
                });
                return;
            }
            const roomData = {
                name,
                description,
                type,
                messId,
                participantIds
            };
            const room = await chatService_1.ChatService.createRoom(userId, roomData);
            res.status(201).json({
                success: true,
                data: room,
                message: 'Room created successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error creating room:', error);
            next(error);
        }
    }
    /**
     * Get room details
     */
    static async getRoomDetails(req, res, next) {
        try {
            const userId = req.user._id;
            const { roomId } = req.params;
            if (!roomId) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID is required'
                });
                return;
            }
            // Check permission
            const { hasPermission, room } = await chatService_1.ChatService.checkRoomPermission(userId, roomId, 'read');
            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    message: 'No permission to access this room'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: room,
                message: 'Room details retrieved successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error getting room details:', error);
            next(error);
        }
    }
    /**
     * Update room settings (only mess owners can update)
     */
    static async updateRoomSettings(req, res, next) {
        try {
            const userId = req.user._id;
            const userRole = req.user.role;
            const { roomId } = req.params;
            const { disappearingMessagesDays, name, description } = req.body;
            if (!roomId) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID is required'
                });
                return;
            }
            // Only mess owners can update room settings
            if (userRole !== 'mess-owner') {
                res.status(403).json({
                    success: false,
                    message: 'Only mess owners can update room settings'
                });
                return;
            }
            // Check permission
            const { hasPermission, room } = await chatService_1.ChatService.checkRoomPermission(userId, roomId, 'manage');
            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    message: 'No permission to update this room'
                });
                return;
            }
            // Update room settings
            const updatedRoom = await chatService_1.ChatService.updateRoomSettings(roomId, userId, {
                disappearingMessagesDays: disappearingMessagesDays !== undefined ? disappearingMessagesDays : undefined,
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined
            });
            res.status(200).json({
                success: true,
                data: updatedRoom,
                message: 'Room settings updated successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error updating room settings:', error);
            next(error);
        }
    }
    /**
     * Delete a chat room
     */
    static async deleteRoom(req, res, next) {
        try {
            const userId = req.user._id;
            const { roomId } = req.params;
            if (!roomId) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID is required'
                });
                return;
            }
            // Check permission (only room creator can delete)
            const { hasPermission, room } = await chatService_1.ChatService.checkRoomPermission(userId, roomId, 'manage');
            if (!hasPermission || !room) {
                res.status(403).json({
                    success: false,
                    message: 'No permission to delete this room'
                });
                return;
            }
            // Don't allow deletion of default mess groups
            if (room.isDefault) {
                res.status(400).json({
                    success: false,
                    message: 'Cannot delete default mess group'
                });
                return;
            }
            // Check if user is the creator
            if (room.createdBy.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Only room creator can delete the room'
                });
                return;
            }
            await chatService_1.ChatService.deleteRoom(roomId);
            res.status(200).json({
                success: true,
                message: 'Room deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting room:', error);
            next(error);
        }
    }
    /**
     * Send a message to a room
     */
    static async sendMessage(req, res, next) {
        try {
            const userId = req.user._id;
            const { roomId, content, messageType = 'text', replyTo, attachments } = req.body;
            // Validate required fields
            if (!roomId || !content) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: roomId, content'
                });
                return;
            }
            // Validate message type
            if (!['text', 'image', 'file', 'system'].includes(messageType)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid message type'
                });
                return;
            }
            const messageData = {
                roomId,
                content,
                messageType,
                replyTo,
                attachments
            };
            const message = await chatService_1.ChatService.sendMessage(userId, messageData);
            res.status(201).json({
                success: true,
                data: message,
                message: 'Message sent successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error sending message:', error);
            next(error);
        }
    }
    /**
     * Get messages for a room
     */
    static async getRoomMessages(req, res, next) {
        try {
            const userId = req.user._id;
            const { roomId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 messages per request
            if (!roomId) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID is required'
                });
                return;
            }
            const messages = await chatService_1.ChatService.getRoomMessages(userId, roomId, page, limit);
            res.status(200).json({
                success: true,
                data: messages,
                pagination: {
                    page,
                    limit,
                    total: messages.length
                },
                message: 'Messages retrieved successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error getting room messages:', error);
            next(error);
        }
    }
    /**
     * Mark messages as read
     */
    static async markMessagesAsRead(req, res, next) {
        try {
            const userId = req.user._id;
            const { roomId } = req.params;
            const { messageIds } = req.body;
            if (!roomId) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID is required'
                });
                return;
            }
            if (!Array.isArray(messageIds)) {
                res.status(400).json({
                    success: false,
                    message: 'messageIds must be an array'
                });
                return;
            }
            await chatService_1.ChatService.markMessagesAsRead(userId, roomId, messageIds);
            res.status(200).json({
                success: true,
                message: 'Messages marked as read'
            });
        }
        catch (error) {
            logger_1.default.error('Error marking messages as read:', error);
            next(error);
        }
    }
    /**
     * Get user's chat notifications
     */
    static async getNotifications(req, res, next) {
        try {
            const userId = req.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const unreadOnly = req.query.unreadOnly === 'true';
            const query = { userId };
            if (unreadOnly) {
                query.isRead = false;
            }
            const skip = (page - 1) * limit;
            const notifications = await ChatNotification_1.default.find(query)
                .populate('roomId', 'name type')
                .populate('messageId', 'content messageType')
                .populate('metadata.senderId', 'firstName lastName profilePicture')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await ChatNotification_1.default.countDocuments(query);
            res.status(200).json({
                success: true,
                data: notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                message: 'Notifications retrieved successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error getting notifications:', error);
            next(error);
        }
    }
    /**
     * Mark notification as read
     */
    static async markNotificationAsRead(req, res, next) {
        try {
            const userId = req.user._id;
            const { notificationId } = req.params;
            const notification = await ChatNotification_1.default.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true, readAt: new Date() }, { new: true });
            if (!notification) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: notification,
                message: 'Notification marked as read'
            });
        }
        catch (error) {
            logger_1.default.error('Error marking notification as read:', error);
            next(error);
        }
    }
    /**
     * Get mess members for creating a room
     */
    static async getMessMembers(req, res, next) {
        try {
            const userId = req.user._id;
            const user = await User_1.default.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            let messId;
            if (user.role === 'mess-owner') {
                const messProfile = await MessProfile_1.default.findOne({ userId });
                if (!messProfile) {
                    res.status(404).json({
                        success: false,
                        message: 'Mess profile not found'
                    });
                    return;
                }
                messId = messProfile._id;
            }
            else if (user.role === 'user' && user.messId) {
                messId = user.messId;
            }
            else if (user.role === 'admin') {
                // Admin can see all messes - get from query param
                messId = req.query.messId;
            }
            else {
                res.status(403).json({
                    success: false,
                    message: 'No mess association found'
                });
                return;
            }
            if (!messId) {
                res.status(400).json({
                    success: false,
                    message: 'Mess ID is required'
                });
                return;
            }
            // Get mess members
            const memberships = await MessMembership_1.default.find({
                messId,
                status: 'active'
            }).populate('userId', 'firstName lastName email profilePicture role');
            const members = memberships.map(membership => ({
                _id: membership.userId._id,
                firstName: membership.userId.firstName,
                lastName: membership.userId.lastName,
                email: membership.userId.email,
                profilePicture: membership.userId.profilePicture,
                role: membership.userId.role,
                joinDate: membership.joinDate
            }));
            res.status(200).json({
                success: true,
                data: members,
                message: 'Mess members retrieved successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error getting mess members:', error);
            next(error);
        }
    }
    /**
     * Check if users can communicate
     */
    static async checkCommunicationPermission(req, res, next) {
        try {
            const userId = req.user._id;
            const { targetUserId } = req.params;
            if (!targetUserId) {
                res.status(400).json({
                    success: false,
                    message: 'Target user ID is required'
                });
                return;
            }
            const canCommunicate = await chatService_1.ChatService.canUsersCommunicate(userId, targetUserId);
            res.status(200).json({
                success: true,
                data: { canCommunicate },
                message: 'Communication permission checked'
            });
        }
        catch (error) {
            logger_1.default.error('Error checking communication permission:', error);
            next(error);
        }
    }
    /**
     * Delete a message
     */
    static async deleteMessage(req, res, next) {
        try {
            const userId = req.user._id;
            const { messageId } = req.params;
            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required'
                });
                return;
            }
            const message = await chatService_1.ChatService.deleteMessage(userId, messageId);
            res.status(200).json({
                success: true,
                data: message,
                message: 'Message deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting message:', error);
            next(error);
        }
    }
    /**
     * Add reaction to a message
     */
    static async addReaction(req, res, next) {
        try {
            const userId = req.user._id;
            const { messageId } = req.params;
            const { emoji } = req.body;
            if (!messageId || !emoji) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID and emoji are required'
                });
                return;
            }
            const message = await chatService_1.ChatService.addReaction(userId, messageId, emoji);
            res.status(200).json({
                success: true,
                data: message,
                message: 'Reaction added successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error adding reaction:', error);
            next(error);
        }
    }
    /**
     * Mass delete messages
     */
    static async massDeleteMessages(req, res, next) {
        try {
            const userId = req.user._id;
            const { messageIds } = req.body;
            if (!Array.isArray(messageIds) || messageIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'messageIds must be a non-empty array'
                });
                return;
            }
            const deletedCount = await chatService_1.ChatService.massDeleteMessages(userId, messageIds);
            res.status(200).json({
                success: true,
                data: { deletedCount },
                message: `${deletedCount} messages deleted successfully`
            });
        }
        catch (error) {
            logger_1.default.error('Error in mass delete messages:', error);
            next(error);
        }
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chatController.js.map