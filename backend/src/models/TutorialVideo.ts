import mongoose, { Document, Schema } from 'mongoose';

export interface ITutorialVideo extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  category: 'user' | 'mess-owner' | 'general';
  order: number;
  thumbnailUrl?: string;
  duration?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const TutorialVideoSchema = new Schema<ITutorialVideo>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['user', 'mess-owner', 'general'],
    required: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true,
    default: '0:00'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TutorialVideoSchema.index({ category: 1, isActive: 1 });
TutorialVideoSchema.index({ order: 1 });

export default mongoose.model<ITutorialVideo>('TutorialVideo', TutorialVideoSchema);


