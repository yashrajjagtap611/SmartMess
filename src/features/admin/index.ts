// Admin Feature - Main Export File
// This file exports all admin-related components and utilities

// Admin Dashboard Components
export { default as AdminDashboard } from './components/AdminDashboard/AdminDashboard';
export { useAdminDashboard as AdminDashboardHooks } from './components/AdminDashboard/AdminDashboard.hooks';

// User Management Components
export { default as AdminUserManagement } from './components/UserManagement/UserManagement';
export { default as UserList } from './components/UserList/UserList';

// Mess Owner Management Components
export { default as AdminMessOwnerManagement } from './components/MessOwnerManagement/MessOwnerManagement';

// Subscription Management Components
export { default as AdminSubscriptionManagement } from './components/PlatformSubscriptionManagement/SubscriptionManagement';

// Billing & Payments Components
export { default as AdminBillingPayments } from './components/BillingPayments/BillingPayments';

// System Monitoring Components
export { default as AdminSystemMonitoring } from './components/SystemMonitoring/SystemMonitoring';

// Admin Settings Components
export { default as AdminSettings } from './components/AdminSettings/AdminSettings';

// Notification Components (redirected to common Notification)
export { default as AdminNotification } from '@/features/Notification/Notification';

// Profile Components
export { default as AdminProfile } from './components/Profile/Profile';

// Default Meal Plans Components
export { DefaultMealPlans } from './components/DefaultMealPlans/DefaultMealPlans';

// Tutorial Videos Management Components
export { TutorialVideosManagement } from './components/TutorialVideosManagement';

// Ad Settings Components (common component from ADServices)
export { default as AdminAdSettings } from '@/features/ADServices/Components/AdSettings';

// Re-export hooks and utilities
export * from './components/AdminDashboard/AdminDashboard.hooks';





