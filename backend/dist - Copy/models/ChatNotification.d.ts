import mongoose, { Document } from 'mongoose';
export interface IChatNotification extends Document {
    userId: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    messageId?: mongoose.Types.ObjectId;
    type: 'new_message' | 'mention' | 'reaction' | 'room_invite' | 'room_update';
    title: string;
    content: string;
    isRead: boolean;
    readAt?: Date;
    priority: 'low' | 'medium' | 'high';
    metadata?: {
        senderId?: mongoose.Types.ObjectId;
        senderName?: string;
        roomName?: string;
        emoji?: string;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChatNotification, {}, {}, {}, mongoose.Document<unknown, {}, IChatNotification> & IChatNotification & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=ChatNotification.d.ts.map