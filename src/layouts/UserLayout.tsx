import React from "react";
import { SideNavigation, BottomNavigation } from "@/components/common/Navbar/CommonNavbar";
import { useTheme } from "@/components/theme/theme-provider";
import { useNavigate } from "react-router-dom";
import { handleLogout as logoutUtil } from "@/utils/logout";
import CommonHeader from "@/components/common/Header/CommonHeader";

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="transition-all duration-300">
        <CommonHeader title="SmartMess" />
        {children}
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default UserLayout;