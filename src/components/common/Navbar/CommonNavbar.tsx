// src/components/common/Navbar/CommonNavbar.tsx
import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";
import { useUser } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

// Define the navigation item type
type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
  exact: boolean;
};

// Navigation configuration for different roles
const NAVIGATION_CONFIG = {
  user: {
    items: [
      { id: "dashboard", label: "Dashboard", icon: "home", route: ROUTES.USER.DASHBOARD, exact: true },
      { id: "meal-scanner", label: "Verify Membership", icon: "qr_code_scanner", route: ROUTES.USER.MEAL_SCANNER, exact: false },
      { id: "billing", label: "Billing & Payments", icon: "account_balance_wallet", route: ROUTES.USER.BILLING, exact: false },
      { id: "chat", label: "Chat Community", icon: "chat_bubble_outline", route: ROUTES.USER.CHAT, exact: false },
      { id: "notifications", label: "Notifications", icon: "notifications_none", route: ROUTES.USER.NOTIFICATIONS, exact: false },
      { id: "profile", label: "Profile", icon: "account_circle", route: ROUTES.USER.PROFILE, exact: true },
      { id: "apply-leave", label: "Apply Leave", icon: "event_note", route: ROUTES.USER.APPLY_LEAVE, exact: false },
      { id: "how-to-use", label: "How to Use", icon: "help_outline", route: ROUTES.USER.HOW_TO_USE, exact: false },
    ] as NavigationItem[],
    title: "SmartMess",
    subtitle: "User Portal",
  },
  "mess-owner": {
    items: [
      { id: "dashboard", label: "Dashboard", icon: "grid_view", route: ROUTES.MESS_OWNER.DASHBOARD, exact: true },
      { id: "billing", label: "Billing & Payments", icon: "receipt_long", route: ROUTES.MESS_OWNER.BILLING, exact: false },
      { id: "users", label: "User Management", icon: "group", route: ROUTES.MESS_OWNER.USERS, exact: false },
      { id: "join-requests", label: "Join Requests", icon: "person_add", route: ROUTES.MESS_OWNER.JOIN_REQUESTS, exact: false },
      { id: "meal", label: "Meal Management", icon: "restaurant", route: ROUTES.MESS_OWNER.MEAL, exact: false },
      { id: "chat", label: "Chat Community", icon: "chat", route: ROUTES.MESS_OWNER.CHAT, exact: false },
      { id: "feedback", label: "Feedback", icon: "feedback", route: ROUTES.MESS_OWNER.FEEDBACK, exact: false },
      { id: "leave", label: "Leave Management", icon: "event_note", route: ROUTES.MESS_OWNER.LEAVE, exact: false },
      { id: "notification", label: "Notification", icon: "notifications", route: ROUTES.MESS_OWNER.NOTIFICATIONS, exact: false },
      { id: "reports", label: "Reports & Analytics", icon: "analytics", route: ROUTES.MESS_OWNER.REPORTS, exact: false },
      { id: "services", label: "Ad Services", icon: "campaign", route: ROUTES.MESS_OWNER.SERVICES, exact: false },
      { id: "platform-subscription", label: "Platform Subscription", icon: "subscription", route: ROUTES.MESS_OWNER.PLATFORM_SUBSCRIPTION, exact: false },
      { id: "settings", label: "Settings", icon: "settings", route: ROUTES.MESS_OWNER.SETTINGS, exact: false },
      { id: "profile", label: "Profile", icon: "person", route: ROUTES.MESS_OWNER.PROFILE, exact: true },
      { id: "how-to-use", label: "How to Use", icon: "help_outline", route: ROUTES.MESS_OWNER.HOW_TO_USE, exact: false },
    ] as NavigationItem[],
    title: "SmartMess",
    subtitle: "Mess Owner Portal",
  },
  admin: {
    items: [
      { id: "dashboard", label: "Dashboard", icon: "dashboard", route: ROUTES.ADMIN.DASHBOARD, exact: true },
      { id: "users", label: "User Management", icon: "group", route: ROUTES.ADMIN.USER_MANAGEMENT, exact: false },
      { id: "owners", label: "Mess Owners", icon: "business", route: ROUTES.ADMIN.MESS_OWNERS, exact: false },
      { id: "default-meal-plans", label: "Default Meal Plans", icon: "restaurant_menu", route: ROUTES.ADMIN.DEFAULT_MEAL_PLANS, exact: false },
      { id: "billing", label: "Billing & Payments", icon: "receipt_long", route: ROUTES.ADMIN.BILLING, exact: false },
      { id: "monitoring", label: "System Monitoring", icon: "analytics", route: ROUTES.ADMIN.SYSTEM_MONITORING, exact: false },
      { id: "settings", label: "Settings", icon: "settings", route: ROUTES.ADMIN.SETTINGS, exact: false },
      { id: "ad-settings", label: "Ad Services", icon: "campaign", route: ROUTES.ADMIN.AD_SETTINGS, exact: false },
      { id: "profile", label: "Profile", icon: "person", route: ROUTES.ADMIN.PROFILE, exact: true },
      { id: "chat", label: "Chat", icon: "chat", route: ROUTES.ADMIN.CHAT, exact: false },
      { id: "subscriptions", label: "Subscriptions", icon: "subscriptions", route: ROUTES.ADMIN.SUBSCRIPTIONS, exact: false },
      { id: "tutorial-videos", label: "Tutorial Videos", icon: "play_circle_outline", route: ROUTES.ADMIN.TUTORIAL_VIDEOS, exact: false },
    ] as NavigationItem[],
    title: "SmartMess",
    subtitle: "Admin Portal",
  },
};

interface NavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleLogout: () => void;
}

export const SideNavigation: React.FC<NavigationProps> = ({ 
  isDarkMode, 
  toggleDarkMode, 
  handleLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  // Get current user role and navigation config
  const userRole = authService.getCurrentUserRole() as keyof typeof NAVIGATION_CONFIG;
  const navConfig = NAVIGATION_CONFIG[userRole] || NAVIGATION_CONFIG.user;
  const navItems = navConfig.items;

  // Active tab detection logic
  const activeTab = (() => {
    const currentPath = location.pathname;
    
    // First, check for exact matches
    const exactMatch = navItems.find((item) => 
      item.exact && currentPath === item.route
    );
    if (exactMatch) return exactMatch.id;
    
    // Then check for partial matches
    const partialMatch = navItems.find((item) => 
      !item.exact && currentPath.startsWith(item.route)
    );
    if (partialMatch) return partialMatch.id;
    
    return null;
  })();

  // Refs for each nav item
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (activeTab) {
      const idx = navItems.findIndex((item) => item.id === activeTab);
      const el = navRefs.current[idx];
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [activeTab, navItems]);

  const handleNavClick = (item: (typeof navItems)[0]) => {
    navigate(item.route);
  };

  const handleProfileClick = () => {
    const profileRoute = navItems.find(item => item.id === 'profile')?.route;
    if (profileRoute) {
      navigate(profileRoute);
    }
  };

  return (
    <aside className="sidebar w-56 h-screen fixed top-0 left-0 z-20 hidden lg:flex lg:flex-col bg-card border-r border-border">
      {/* Logo Section */}
      <div className="flex items-center space-x-4 p-6 flex-shrink-0">
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded-xl shadow-lg">
          <span className="material-icons text-white text-2xl">ramen_dining</span>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
            {navConfig.title}
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">
            {navConfig.subtitle}
          </p>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        <nav className="flex flex-col space-y-1 p-4">
          {navItems.map((item, idx) => (
            <button
              key={item.id}
              ref={(el) => (navRefs.current[idx] = el)}
              onClick={() => handleNavClick(item)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "active-link bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <span className="material-icons">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="SmartMess-light-surface dark:SmartMess-dark-surface flex-shrink-0">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-lg">wb_sunny</span>
            <span className="text-sm">Light</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              isDarkMode ? "bg-primary" : "bg-muted"
            }`}
            type="button"
            aria-label="Toggle dark mode"
          >
            <span className="sr-only">Toggle theme</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                isDarkMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center space-x-2">
            <span className="material-icons text-lg">brightness_2</span>
            <span className="text-sm">Dark</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 p-4 border-t border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-8 h-8 object-cover rounded-full"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <span className="text-xs font-bold text-primary-foreground">
                {(() => {
                  let initials = "U";
                  if (user && typeof user === "object") {
                    const first = user.firstName?.[0] || "";
                    const last = user.lastName?.[0] || "";
                    if (first || last) {
                      initials = (first + last).toUpperCase();
                    } else if (user.email) {
                      initials = user.email[0]?.toUpperCase() || "U";
                    }
                  }
                  return initials;
                })()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <p className="font-semibold text-card-foreground text-sm truncate">
              {(() => {
                if (!user || typeof user !== 'object') return "User";
                const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
                if (name) return name;
                if (user.email) return user.email;
                return "User";
              })()}
            </p>
            <button
              onClick={handleProfileClick}
              className="ml-2 p-1 rounded-full hover:bg-accent transition-colors"
              aria-label="View Profile"
            >
              <User className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 pt-2">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 text-muted-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full"
          >
            <span className="material-icons">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export const BottomNavigation: React.FC<NavigationProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user role and navigation config
  const userRole = authService.getCurrentUserRole() as keyof typeof NAVIGATION_CONFIG;
  const navConfig = NAVIGATION_CONFIG[userRole] || NAVIGATION_CONFIG.user;
  const navItems = navConfig.items;

  // Active tab detection logic
  const activeTab = (() => {
    const currentPath = location.pathname;
    
    // First, check for exact matches
    const exactMatch = navItems.find((item) => 
      item.exact && currentPath === item.route
    );
    if (exactMatch) return exactMatch.id;
    
    // Then check for partial matches
    const partialMatch = navItems.find((item) => 
      !item.exact && currentPath.startsWith(item.route)
    );
    if (partialMatch) return partialMatch.id;
    
    return null;
  })();

  // Get mobile tabs based on role
  const getMobileTabs = () => {
    switch (userRole) {
      case 'user':
        // For user, return left and right tabs separately (center button is special)
        return {
          left: [
            navItems.find((item) => item.id === "dashboard"),
            navItems.find((item) => item.id === "billing"),
          ].filter(Boolean),
          center: navItems.find((item) => item.id === "meal-scanner"),
          right: [
            navItems.find((item) => item.id === "chat"),
            navItems.find((item) => item.id === "profile"),
          ].filter(Boolean),
        };
      case 'mess-owner':
        return {
          left: [
            navItems.find((item) => item.id === "dashboard"),
            navItems.find((item) => item.id === "users"),
            navItems.find((item) => item.id === "join-requests"),
            navItems.find((item) => item.id === "chat"),
            navItems.find((item) => item.id === "profile"),
          ].filter(Boolean),
          center: null,
          right: [],
        };
      case 'admin':
        return {
          left: [
            navItems.find((item) => item.id === "dashboard"),
            navItems.find((item) => item.id === "billing"),
            navItems.find((item) => item.id === "owners"),
            navItems.find((item) => item.id === "chat"),
            navItems.find((item) => item.id === "profile"),
          ].filter(Boolean),
          center: null,
          right: [],
        };
      default:
        return {
          left: navItems.slice(0, 5).filter(Boolean),
          center: null,
          right: [],
        };
    }
  };

  const mobileTabs = getMobileTabs();
  const isUserRole = userRole === 'user';

  const shortLabels: Record<string, string> = {
    dashboard: "Home",
    billing: "Billing",
    "apply-leave": "Leave",
    "meal-scanner": "Verify",
    chat: "Chat",
    notifications: "Alerts",
    profile: "Profile",
    meal: "Meal",
    users: "Users",
    "join-requests": "Requests",
    services: "Ads",
    settings: "Settings",
    "ad-settings": "Ads",
    owners: "Owners",
    subscriptions: "Subs",
  };

  const handleNavClick = (item: (typeof navItems)[0]) => {
    navigate(item.route);
  };

  const getShortLabel = (item: NavigationItem) => {
    return shortLabels[item.id as keyof typeof shortLabels] ||
      item.label.split("&")[0]?.trim() || 
      item.label.split(" ")[0] || 
      item.label;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-[68px] sm:h-20 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {/* Light mode glass morphism background */}
      <div 
        className="absolute inset-0 dark:hidden"
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      />
      {/* Dark mode glass effect - darker background for better visibility */}
      <div 
        className="absolute inset-0 hidden dark:block"
        style={{
          background: 'linear-gradient(to top, rgba(30, 30, 30, 0.95) 0%, rgba(25, 25, 25, 0.9) 100%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      />
      {/* Border and shadow */}
      <div className="absolute inset-0 border-t border-border/50 dark:border-white/10" />
      <div className="absolute inset-0 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.8)] pointer-events-none" />
      
      {/* Navigation content */}
      <div className="relative flex items-center justify-around px-2 sm:px-3 h-full">
      {isUserRole ? (
        <>
          {/* Left Side Tabs */}
          <div className="flex items-center justify-center flex-1 gap-0.5 sm:gap-1">
            {mobileTabs.left.map((item) =>
              item ? (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center justify-center transition-all duration-300 focus:outline-none relative min-w-0 flex-1 max-w-[85px] sm:max-w-[100px] group touch-manipulation py-1.5 sm:py-2 ${
                    activeTab === item.id
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground dark:text-gray-400 active:text-primary"
                  }`}
                  aria-label={item.label}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  {/* Active indicator background with rounded top */}
                  {activeTab === item.id && (
                    <div className="absolute inset-x-0 -top-1 sm:-top-3 h-1 bg-primary dark:bg-primary rounded-b-full opacity-60 dark:opacity-80" />
                  )}
                  
                  {/* Icon container */}
                  <div className={`relative flex items-center justify-center mb-0.5 sm:mb-1 transition-all duration-300 w-full ${
                    activeTab === item.id 
                      ? 'scale-110 translate-y-[-2px]' 
                      : 'scale-100 group-active:scale-105'
                  }`}>
                    <span className={`material-icons transition-all duration-300 leading-none flex items-center justify-center ${
                      activeTab === item.id ? 'text-[28px] sm:text-3xl' : 'text-2xl sm:text-[26px]'
                    }`} style={{ 
                      fontVariationSettings: 'normal',
                      WebkitFontSmoothing: 'antialiased',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </span>
                    
                    {/* Active dot indicator */}
                    {activeTab === item.id && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Label with smooth animation - always visible on mobile for better UX */}
                  <span className={`text-[10px] sm:text-[11px] font-semibold transition-all duration-300 truncate w-full text-center leading-tight ${
                    activeTab === item.id 
                      ? 'opacity-100 translate-y-0 max-h-4 mt-0.5 text-primary dark:text-primary' 
                      : 'opacity-70 dark:opacity-60 translate-y-0 max-h-4 text-muted-foreground dark:text-gray-400'
                  }`}>
                    {getShortLabel(item)}
                  </span>
                </button>
              ) : null
            )}
          </div>

          {/* Center Scanner Button (Elevated) */}
          {mobileTabs.center && (
            <div className="relative flex items-center justify-center flex-shrink-0 -translate-y-4 sm:-translate-y-5">
              <button
                onClick={() => handleNavClick(mobileTabs.center!)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none touch-manipulation ${
                  activeTab === mobileTabs.center.id
                    ? "bg-primary text-primary-foreground scale-110 shadow-xl shadow-primary/40"
                    : "bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
                }`}
                aria-label={mobileTabs.center.label}
                aria-current={activeTab === mobileTabs.center.id ? 'page' : undefined}
              >
                {/* Outer ring animation */}
                {activeTab === mobileTabs.center.id && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                )}
                
                {/* Icon */}
                <span className="material-icons text-3xl sm:text-4xl relative z-10 leading-none flex items-center justify-center" style={{ 
                  fontVariationSettings: 'normal',
                  WebkitFontSmoothing: 'antialiased',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {mobileTabs.center.icon}
                </span>
                
                {/* Pulse effect */}
                {activeTab === mobileTabs.center.id && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                )}
              </button>
              
              {/* Label below center button */}
              <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2">
                <span className={`text-[10px] sm:text-[11px] font-semibold text-primary transition-all duration-300 ${
                  activeTab === mobileTabs.center.id 
                    ? 'opacity-100' 
                    : 'opacity-0'
                }`}>
                  {getShortLabel(mobileTabs.center)}
                </span>
              </div>
            </div>
          )}

          {/* Right Side Tabs */}
          <div className="flex items-center justify-center flex-1 gap-0.5 sm:gap-1">
            {mobileTabs.right.map((item) =>
              item ? (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center justify-center transition-all duration-300 focus:outline-none relative min-w-0 flex-1 max-w-[85px] sm:max-w-[100px] group touch-manipulation py-1.5 sm:py-2 ${
                    activeTab === item.id
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground dark:text-gray-400 active:text-primary"
                  }`}
                  aria-label={item.label}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  {/* Active indicator background with rounded top */}
                  {activeTab === item.id && (
                    <div className="absolute inset-x-0 -top-1 sm:-top-3 h-1 bg-primary dark:bg-primary rounded-b-full opacity-60 dark:opacity-80" />
                  )}
                  
                  {/* Icon container */}
                  <div className={`relative flex items-center justify-center mb-0.5 sm:mb-1 transition-all duration-300 w-full ${
                    activeTab === item.id 
                      ? 'scale-110 translate-y-[-2px]' 
                      : 'scale-100 group-active:scale-105'
                  }`}>
                    <span className={`material-icons transition-all duration-300 leading-none flex items-center justify-center ${
                      activeTab === item.id ? 'text-[28px] sm:text-3xl' : 'text-2xl sm:text-[26px]'
                    }`} style={{ 
                      fontVariationSettings: 'normal',
                      WebkitFontSmoothing: 'antialiased',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </span>
                    
                    {/* Active dot indicator */}
                    {activeTab === item.id && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Label with smooth animation - always visible on mobile for better UX */}
                  <span className={`text-[10px] sm:text-[11px] font-semibold transition-all duration-300 truncate w-full text-center leading-tight ${
                    activeTab === item.id 
                      ? 'opacity-100 translate-y-0 max-h-4 mt-0.5 text-primary dark:text-primary' 
                      : 'opacity-70 dark:opacity-60 translate-y-0 max-h-4 text-muted-foreground dark:text-gray-400'
                  }`}>
                    {getShortLabel(item)}
                  </span>
                </button>
              ) : null
            )}
          </div>
        </>
      ) : (
        // Default layout for non-user roles
        <>
          {(mobileTabs.left || []).map((item) =>
            item ? (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center transition-all duration-300 focus:outline-none relative min-w-0 flex-1 max-w-[85px] sm:max-w-[100px] group touch-manipulation py-1.5 sm:py-2 ${
                  activeTab === item.id
                    ? "text-primary dark:text-primary"
                    : "text-muted-foreground dark:text-gray-400 active:text-primary"
                }`}
                aria-label={item.label}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                {/* Active indicator background with rounded top */}
                {activeTab === item.id && (
                  <div className="absolute inset-x-0 -top-1 sm:-top-3 h-1 bg-primary dark:bg-primary rounded-b-full opacity-60 dark:opacity-80" />
                )}
                
                {/* Icon container */}
                <div className={`relative flex items-center justify-center mb-0.5 sm:mb-1 transition-all duration-300 w-full ${
                  activeTab === item.id 
                    ? 'scale-110 translate-y-[-2px]' 
                    : 'scale-100 group-active:scale-105'
                }`}>
                  <span className={`material-icons transition-all duration-300 leading-none flex items-center justify-center ${
                    activeTab === item.id ? 'text-[28px] sm:text-3xl' : 'text-2xl sm:text-[26px]'
                  }`} style={{ 
                    fontVariationSettings: 'normal',
                    WebkitFontSmoothing: 'antialiased',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </span>
                  
                  {/* Active dot indicator */}
                  {activeTab === item.id && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Label with smooth animation - always visible on mobile for better UX */}
                <span className={`text-[10px] sm:text-[11px] font-semibold transition-all duration-300 truncate w-full text-center leading-tight ${
                  activeTab === item.id 
                    ? 'opacity-100 translate-y-0 max-h-4 mt-0.5 text-primary dark:text-primary' 
                    : 'opacity-70 dark:opacity-60 translate-y-0 max-h-4 text-muted-foreground dark:text-gray-400'
                }`}>
                  {getShortLabel(item)}
                </span>
              </button>
            ) : null
          )}
        </>
      )}
      </div>
    </nav>
  );
};

export default SideNavigation;
