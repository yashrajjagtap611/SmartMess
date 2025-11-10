import React from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from "@/components/theme/theme-provider";
import { handleLogout as logoutUtil } from "@/utils/logout";
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { useUser } from '@/contexts/AuthContext';
import LeaveManagementContent from './components/LeaveManagementContent';

const LeaveManagement: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { user } = useUser();

  const handleLogout = () => {
    logoutUtil(window.location.href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="flex-1">
        <CommonHeader
          title="Leave Management"
          subtitle="Manage leave requests and mess off days"
          {...(user && {
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              email: user.email
            }
          })}
          showUserProfile={true}
          onUserProfileClick={() => {}}
          variant="settings"
        />
        <LeaveManagementContent />
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default LeaveManagement;