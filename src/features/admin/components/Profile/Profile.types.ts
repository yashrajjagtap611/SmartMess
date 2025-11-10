export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  dob?: string; // Add for compatibility with form data
  avatar?: string;
  role: 'admin' | 'super-admin';
  permissions: string[];
  lastLogin: string;
  loginCount: number;
  accountCreated: string;
  createdAt?: string; // Add for compatibility with user data
  isActive: boolean;
  department: string;
  employeeId: string;
  securityLevel: 'standard' | 'high' | 'critical';
  gender?: 'male' | 'female' | 'other';
  isVerified: boolean;
  status?: string; // Add for compatibility with user data
  updatedAt: string;
}

export interface AdminFormState {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  department: string;
  gender?: 'male' | 'female' | 'other';
}

export interface ProfileProps {
  // Add props as needed
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: AdminProfile;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  department?: string;
  gender?: 'male' | 'female' | 'other';
}
