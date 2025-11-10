import React from 'react';
import { useUserManagement } from './UserManagement.hooks.ts';
import { UserManagementView } from './components';

const UserManagement: React.FC = () => {
  const userManagementProps = useUserManagement();
  
  return <UserManagementView {...userManagementProps} />;
};

export default UserManagement;
