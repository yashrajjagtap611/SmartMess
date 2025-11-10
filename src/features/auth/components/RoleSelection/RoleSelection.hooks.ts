import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import type { RoleSelectionProps, UserRole } from './RoleSelection.types';
import { validateRoleSelection, getAllRoles, getRoleBenefitsText } from './RoleSelection.utils';

export const useRoleSelection = ({ onRoleSelect, onBack, onContinue }: RoleSelectionProps = {}) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = getAllRoles();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (onRoleSelect) {
      onRoleSelect(role);
    }
  };

  const handleContinue = () => {
    if (!validateRoleSelection(selectedRole)) {
      return;
    }
    
    if (onContinue) {
      onContinue(selectedRole!);
    } else {
      // Default navigation to register screen with role parameter
      navigate(ROUTES.PUBLIC.REGISTER, { state: { role: selectedRole } });
    }
  };

  const handleBack = () => {
    console.log('RoleSelection: handleBack called', { onBack: !!onBack });
    if (onBack) {
      console.log('RoleSelection: calling onBack prop');
      onBack();
    } else {
      console.log('RoleSelection: navigating to login');
      // Default navigation back to login
      navigate(ROUTES.PUBLIC.LOGIN);
    }
  };

  const isRoleSelected = validateRoleSelection(selectedRole);
  const benefitsText = getRoleBenefitsText(selectedRole);

  return {
    // state
    isDarkMode,
    selectedRole,
    roles,
    isRoleSelected,
    benefitsText,
    // actions
    toggleTheme,
    handleRoleSelect,
    handleContinue,
    handleBack,
  };
};
