export type UserRole = 'user' | 'mess-owner';

export interface RoleSelectionProps {
  onRoleSelect?: (role: UserRole) => void;
  onBack?: () => void;
  onContinue?: (role: UserRole) => void;
}

export interface RoleSelectionState {
  selectedRole: UserRole | null;
  isDarkMode: boolean;
}

export interface RoleInfo {
  id: UserRole;
  title: string;
  description: string;
  benefits: string[];
  icon: 'Users' | 'Building2';
}

export interface RoleSelectionData {
  role: UserRole;
  timestamp: Date;
}









