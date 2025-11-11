import mongoose, { Document } from 'mongoose';
export interface IChatMessage extends Document {
    roomId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedAt: Date;
    }>;
    replyTo?: mongoose.Types.ObjectId;
    editedAt?: Date;
    isEdited: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    reactions: Array<{
        userId: mongoose.Types.ObjectId;
        emoji: string;
        addedAt: Date;
    }>;
    readBy: Array<{
        userId: mongoose.Types.ObjectId;
        readAt: Date;
    }>;
    isPinned: boolean;
    pinnedAt?: Date;
    pinnedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChatMessage, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessage> & IChatMessage & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=ChatMessage.d.ts.map