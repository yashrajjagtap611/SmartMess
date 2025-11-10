import mongoose, { Schema, Document } from 'mongoose';

export interface IMessLeave extends Document {
  messId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  leaveType: 'holiday' | 'maintenance' | 'personal' | 'emergency' | 'seasonal' | 'other';
  reason?: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    occurrences?: number;
  };
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notificationsSent: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  affectedUsers: number;
  estimatedSavings?: number;
}

const MessLeaveSchema: Schema = new Schema({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['holiday', 'maintenance', 'personal', 'emergency', 'seasonal', 'other'],
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  mealTypes: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    endDate: Date,
    occurrences: {
      type: Number,
      min: 1
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notificationsSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  affectedUsers: {
    type: Number,
    default: 0
  },
  estimatedSavings: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
MessLeaveSchema.index({ messId: 1, startDate: 1 });
MessLeaveSchema.index({ messId: 1, status: 1 });
MessLeaveSchema.index({ createdBy: 1 });
MessLeaveSchema.index({ startDate: 1, endDate: 1 });

// Validation to ensure endDate is not before startDate
MessLeaveSchema.pre('save', function(next) {
  if (this['endDate'] < this['startDate']) {
    next(new Error('End date cannot be before start date'));
  } else {
    next();
  }
});

// Auto-update status based on dates
MessLeaveSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this['status'] === 'scheduled') {
    if (now >= this['startDate'] && now <= this['endDate']) {
      this['status'] = 'active';
    } else if (now > this['endDate']) {
      this['status'] = 'completed';
    }
  }
  
  next();
});

export const MessLeave = mongoose.model<IMessLeave>('MessLeave', MessLeaveSchema);
