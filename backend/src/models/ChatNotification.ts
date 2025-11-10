import mongoose, { Document, Schema } from 'mongoose';

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

const ChatNotificationSchema: Schema = new Schema<IChatNotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  roomId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChatRoom', 
    required: true 
  },
  messageId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChatMessage' 
  },
  type: { 
    type: String, 
    enum: ['new_message', 'mention', 'reaction', 'room_invite', 'room_update'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  readAt: { 
    type: Date 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
ChatNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
ChatNotificationSchema.index({ roomId: 1 });
ChatNotificationSchema.index({ type: 1 });
ChatNotificationSchema.index({ priority: 1 });

export default mongoose.model<IChatNotification>('ChatNotification', ChatNotificationSchema);
