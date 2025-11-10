import mongoose, { Document, Schema } from 'mongoose';

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
  replyTo?: mongoose.Types.ObjectId; // For reply functionality
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

const ChatMessageSchema: Schema = new Schema<IChatMessage>({
  roomId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChatRoom', 
    required: true 
  },
  senderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file', 'system'], 
    default: 'text' 
  },
  attachments: [{
    fileName: { 
      type: String, 
      required: true 
    },
    fileUrl: { 
      type: String, 
      required: true 
    },
    fileType: { 
      type: String, 
      required: true 
    },
    fileSize: { 
      type: Number, 
      required: true 
    },
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  replyTo: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChatMessage' 
  },
  editedAt: { 
    type: Date 
  },
  isEdited: { 
    type: Boolean, 
    default: false 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  },
  deletedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reactions: [{
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    emoji: { 
      type: String, 
      required: true 
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  readBy: [{
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    readAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  pinnedAt: { 
    type: Date 
  },
  pinnedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

// Indexes for better performance
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
ChatMessageSchema.index({ senderId: 1 });
ChatMessageSchema.index({ messageType: 1 });
ChatMessageSchema.index({ isDeleted: 1 });
ChatMessageSchema.index({ isPinned: 1 });

// Compound index for efficient queries
ChatMessageSchema.index({ 
  roomId: 1, 
  isDeleted: 1, 
  createdAt: -1 
});

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
