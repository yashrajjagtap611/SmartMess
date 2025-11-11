import { Request, Response, NextFunction } from 'express';
export declare class ChatController {
    /**
     * Get user's chat rooms
     */
    static getUserRooms(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create individual chat between mess owner/admin and user
     */
    static createIndividualChat(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create a new chat room
     */
    static createRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get room details
     */
    static getRoomDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update room settings (only mess owners can update)
     */
    static updateRoomSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a chat room
     */
    static deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Send a message to a room
     */
    static sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get messages for a room
     */
    static getRoomMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark messages as read
     */
    static markMessagesAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's chat notifications
     */
    static getNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark notification as read
     */
    static markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get mess members for creating a room
     */
    static getMessMembers(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Check if users can communicate
     */
    static checkCommunicationPermission(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a message
     */
    static deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add reaction to a message
     */
    static addReaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mass delete messages
     */
    static massDeleteMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=chatController.d.ts.map