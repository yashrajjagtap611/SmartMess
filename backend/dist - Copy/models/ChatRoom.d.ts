import mongoose, { Document } from 'mongoose';
export interface IChatRoom extends Document {
    name: string;
    description?: string;
    type: 'mess' | 'mess-group' | 'announcements' | 'meal-discussions' | 'direct' | 'admin' | 'individual';
    messId?: mongoose.Types.ObjectId;
    participants: Array<{
        userId: mongoose.Types.ObjectId;
        role: 'user' | 'mess-owner' | 'admin';
        joinedAt: Date;
        lastSeen?: Date;
        isActive: boolean;
    }>;
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
    isDefault?: boolean;
    individualWith?: mongoose.Types.ObjectId;
    settings: {
        allowFileUpload: boolean;
        allowImageUpload: boolean;
        maxFileSize: number;
        messageRetentionDays: number;
    };
    disappearingMessagesDays?: number | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChatRoom, {}, {}, {}, mongoose.Document<unknown, {}, IChatRoom> & IChatRoom & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=ChatRoom.d.ts.map