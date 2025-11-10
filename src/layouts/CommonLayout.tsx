// src/layouts/CommonLayout.tsx
import React, { useState, useEffect } from "react";
import { SideNavigation, BottomNavigation } from "@/components/common/Navbar/CommonNavbar";
import { useTheme } from "@/components/theme/theme-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { handleLogout as logoutUtil } from "@/utils/logout";
import { ROUTES } from "@/constants/routes";

const CommonLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isViewingMessages, setIsViewingMessages] = useState(false);

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  // Check if we're on a chat page
  const isChatPage = location.pathname === ROUTES.USER.CHAT || 
                     location.pathname === ROUTES.MESS_OWNER.CHAT || 
                     location.pathname === ROUTES.ADMIN.CHAT ||
                     location.pathname.startsWith('/user/chat') ||
                     location.pathname.startsWith('/mess-owner/chat') ||
                     location.pathname.startsWith('/admin/chat');

  // Listen for chat view state changes (when viewing messages vs room list)
  useEffect(() => {
    if (!isChatPage) {
      setIsViewingMessages(false);
      return;
    }

    // Check initial state from localStorage
    const initialState = localStorage.getItem('chatViewingMessages') === 'true';
    setIsViewingMessages(initialState);

    const handleChatViewStateChange = (event: CustomEvent) => {
      setIsViewingMessages(event.detail.isViewingMessages);
    };

    // Listen for custom event
    window.addEventListener('chatViewStateChanged', handleChatViewStateChange as EventListener);
    
    // Also listen for storage events (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'chatViewingMessages') {
        setIsViewingMessages(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('chatViewStateChanged', handleChatViewStateChange as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isChatPage]);

  // Hide bottom nav when viewing messages, show when viewing room list
  const shouldHideBottomNav = isChatPage && isViewingMessages;

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:bg-SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="transition-all duration-300 lg:ml-56">  
        {children}
      </div>
      {!shouldHideBottomNav && (
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default CommonLayout;

