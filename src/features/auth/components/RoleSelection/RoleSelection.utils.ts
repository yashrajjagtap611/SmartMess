import type { UserRole, RoleInfo, RoleSelectionData } from './RoleSelection.types';

export const getRoleInfo = (role: UserRole): RoleInfo => {
  const roleConfigs: Record<UserRole, RoleInfo> = {
    user: {
      id: 'user',
      title: 'User',
      description: 'Join existing messes and connect with others',
      benefits: [
        'Join multiple messes',
        'Connect with mess members',
        'Access mess information and updates',
        'Participate in mess activities'
      ],
      icon: 'Users'
    },
    'mess-owner': {
      id: 'mess-owner',
      title: 'Mess Owner',
      description: 'Create and manage your own mess',
      benefits: [
        'Create and manage your mess',
        'Invite and manage members',
        'Set mess rules and policies',
        'Access advanced management tools'
      ],
      icon: 'Building2'
    }
  };

  return roleConfigs[role];
};

export const getAllRoles = (): RoleInfo[] => {
  return [
    getRoleInfo('user'),
    getRoleInfo('mess-owner')
  ];
};

export const validateRoleSelection = (role: UserRole | null): boolean => {
  return role !== null && (role === 'user' || role === 'mess-owner');
};

export const formatRoleForDisplay = (role: UserRole): string => {
  const roleInfo = getRoleInfo(role);
  return roleInfo.title;
};

export const createRoleSelectionData = (role: UserRole): RoleSelectionData => {
  return {
    role,
    timestamp: new Date()
  };
};

export const getRoleBenefitsText = (role: UserRole | null): string => {
  if (!role) {
    return 'Select a role to see benefits';
  }
  
  const roleInfo = getRoleInfo(role);
  return `${roleInfo.title} Benefits:`;
};

export const isValidRole = (value: string): value is UserRole => {
  return value === 'user' || value === 'mess-owner';
};









