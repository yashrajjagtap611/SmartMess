import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
  id: string;
  text: string;
  votes: number;
  voters: mongoose.Types.ObjectId[];
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  roomId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  expiresAt?: Date;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const pollOptionSchema = new Schema<IPollOption>({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { _id: false });

const pollSchema = new Schema<IPoll>({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    maxlength: 500
  },
  options: {
    type: [pollOptionSchema],
    required: true,
    validate: {
      validator: function(options: IPollOption[]) {
        return options.length >= 2 && options.length <= 10;
      },
      message: 'Poll must have between 2 and 10 options'
    }
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: [true, 'Room ID is required']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: false
  },
  totalVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
pollSchema.index({ roomId: 1, createdAt: -1 });
pollSchema.index({ createdBy: 1 });
pollSchema.index({ isActive: 1 });

// Pre-save middleware to calculate total votes
pollSchema.pre('save', function(next) {
  this.totalVotes = this.options.reduce((total, option) => total + option.votes, 0);
  next();
});

export const Poll = mongoose.model<IPoll>('Poll', pollSchema);
