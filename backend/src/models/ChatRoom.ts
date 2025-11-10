import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRoom extends Document {
  name: string;
  description?: string;
  type: 'mess' | 'mess-group' | 'announcements' | 'meal-discussions' | 'direct' | 'admin' | 'individual';
  messId?: mongoose.Types.ObjectId; // For mess-specific chats
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
  individualWith?: mongoose.Types.ObjectId; // For individual messaging
  settings: {
    allowFileUpload: boolean;
    allowImageUpload: boolean;
    maxFileSize: number; // in MB
    messageRetentionDays: number;
  };
  disappearingMessagesDays?: number | null; // Number of days after which messages disappear (null = disabled)
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema: Schema = new Schema<IChatRoom>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  type: { 
    type: String, 
    enum: ['mess', 'direct', 'admin', 'individual'], 
    required: true 
  },
  messId: { 
    type: Schema.Types.ObjectId, 
    ref: 'MessProfile',
    required: function() {
      return this.type === 'mess';
    }
  },
  participants: [{
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['user', 'mess-owner', 'admin'], 
      required: true 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    },
    lastSeen: { 
      type: Date 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  }],
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Mark whether this room is the default community group for a mess
  isDefault: {
    type: Boolean,
    default: false
  },
  // For individual messaging - track who the conversation is with
  individualWith: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: IChatRoom) {
      return this.type === 'individual';
    }
  },
  settings: {
    allowFileUpload: { 
      type: Boolean, 
      default: true 
    },
    allowImageUpload: { 
      type: Boolean, 
      default: true 
    },
    maxFileSize: { 
      type: Number, 
      default: 10 // 10MB
    },
    messageRetentionDays: { 
      type: Number, 
      default: 90 // 90 days
    }
  },
  disappearingMessagesDays: {
    type: Number,
    default: null, // null = disabled
    min: 1,
    max: 365
  }
}, {
  timestamps: true
});

// Indexes for better performance
ChatRoomSchema.index({ messId: 1, type: 1 });
ChatRoomSchema.index({ 'participants.userId': 1 });
ChatRoomSchema.index({ type: 1, isActive: 1 });
ChatRoomSchema.index({ createdAt: -1 });

// Note: do not create a unique index on the participants array — creating a
// unique index on an array of subdocuments can cause index creation failures
// and duplicate key errors when multiple rooms have participant arrays. Keep
// participant uniqueness enforced at the application level instead.

export default mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
