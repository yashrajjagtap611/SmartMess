import mongoose, { Document, Schema } from 'mongoose';

export interface IOperatingHour {
  meal: string;
  enabled: boolean;
  start: string;
  end: string;
}

export interface IOperatingHours extends Document {
  userId: mongoose.Types.ObjectId;
  operatingHours: IOperatingHour[];
  createdAt: Date;
  updatedAt: Date;
}

const operatingHourSchema = new Schema<IOperatingHour>({
  meal: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['breakfast', 'lunch', 'dinner']
  },
  enabled: {
    type: Boolean,
    default: true
  },
  start: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  end: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  }
});

const operatingHoursSchema = new Schema<IOperatingHours>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  operatingHours: {
    type: [operatingHourSchema],
    default: [
      { meal: 'breakfast', enabled: true, start: '07:00', end: '09:00' },
      { meal: 'lunch', enabled: true, start: '12:00', end: '14:00' },
      { meal: 'dinner', enabled: true, start: '19:00', end: '21:00' }
    ]
  }
}, {
  timestamps: true
});

// Create indexes for better performance
operatingHoursSchema.index({ userId: 1 });

const OperatingHours = mongoose.model<IOperatingHours>('OperatingHours', operatingHoursSchema);

export default OperatingHours;

