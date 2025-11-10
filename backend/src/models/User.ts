import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'mess-owner' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  messPhotoUrl?: string; // Google Drive file URL for mess photo/logo
  profilePicture?: string; // Profile picture for the user/owner
  lastLogin?: Date;
  status?: 'active' | 'suspended';
  address?: string; // Legacy field - kept for backward compatibility
  currentAddress?: {
    street?: string;
    city?: string;
    district?: string;
    taluka?: string;
    state?: string;
    pincode?: string;
    country?: string;
    latitude?: number; // For debugging location accuracy
    longitude?: number; // For debugging location accuracy
  };
  gender?: 'male' | 'female' | 'other';
  dob?: Date;
  joinDate?: Date; // Date when user joined
  messId?: mongoose.Types.ObjectId; // Reference to mess
  isActive?: boolean; // Active status for queries
  mealPlan?: {
    breakfastPrice?: number;
    lunchPrice?: number;
    dinnerPrice?: number;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'mess-only';
      showEmail: boolean;
      showPhone: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
    dietary?: string[]; // Dietary preferences
    allergies?: string[]; // Food allergies
    mealTimes?: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
  };
  // Student information
  isStudent?: boolean;
  studentInfo?: {
    college?: string;
    course?: string;
    year?: string; // e.g., "1st Year", "2nd Year", "Final Year"
    branch?: string; // e.g., "Computer Science", "Mechanical Engineering"
    collegeEmailId?: string; // College/University email address
  };
  // Profession information
  isWorking?: boolean;
  professionInfo?: {
    company?: string;
    designation?: string; // Job title
    department?: string;
    workExperience?: number; // Years of experience
    workLocation?: string;
    employeeId?: string;
    joiningDate?: Date;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'mess-owner', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  messPhotoUrl: { type: String, default: null }, // For mess logo only
  profilePicture: { type: String, default: null }, // For user profile picture
  lastLogin: { type: Date, default: null },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  address: { type: String, default: '' }, // Legacy field
  currentAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    taluka: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  dob: { type: Date, default: null },
  joinDate: { type: Date, default: Date.now },
  messId: { type: Schema.Types.ObjectId, ref: 'MessProfile', default: null },
  isActive: { type: Boolean, default: true },
  mealPlan: {
    breakfastPrice: { type: Number, default: 30 },
    lunchPrice: { type: Number, default: 50 },
    dinnerPrice: { type: Number, default: 40 }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'mess-only'], default: 'mess-only' },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' },
    dietary: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    mealTimes: {
      breakfast: { type: String, default: '08:00' },
      lunch: { type: String, default: '13:00' },
      dinner: { type: String, default: '19:00' }
    }
  },
  // Student information
  isStudent: { type: Boolean, default: false },
  studentInfo: {
    college: { type: String, default: '' },
    course: { type: String, default: '' },
    year: { type: String, default: '' },
    branch: { type: String, default: '' },
    collegeEmailId: { type: String, default: '' }
  },
  // Profession information
  isWorking: { type: Boolean, default: false },
  professionInfo: {
    company: { type: String, default: '' },
    designation: { type: String, default: '' },
    department: { type: String, default: '' },
    workExperience: { type: Number, default: 0 },
    workLocation: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    joiningDate: { type: Date, default: null }
  }
}, { timestamps: true });

// Add index for email lookup optimization
UserSchema.index({ email: 1 });

// Add comparePassword method
UserSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this['password']);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User; 