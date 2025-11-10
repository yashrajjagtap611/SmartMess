// User Feature - Main Export File
// This file exports all user-related components and utilities

// User Dashboard Components
export { default as UserDashboard } from './components/UserDashboard/UserDashboard';
export { useUserDashboard as UserDashboardHooks } from './components/UserDashboard/UserDashboard.hooks';

// User Profile Components
export { default as UserProfile } from './components/Profile/Profile';

// User Notifications Components (redirected to common Notification)
export { default as UserNotifications } from '@/features/Notification/Notification';

// User Billing & Payments Components
export { default as UserBillingPayments } from './components/BillingPayments/BillingPayments';

// User Chat & Community Components
// export { default as UserChatCommunity } from './components/ChatCommunity/ChatCommunity'; // TODO: Implement ChatCommunity

// User Menu Detail Components
export { default as UserMenuDetail } from './components/MenuDetail';

// User Apply Leave Components
export { default as UserApplyLeave } from './components/ApplyLeave/ApplyLeave';

// User Index Components (barrel exports)
// Note: index/index.tsx contains barrel exports, not a default component

// User Mess Details Modal
export { default as MessDetailsModal } from './components/MessDetailsModal/MessDetailsModal';

// User Payment Options Components
export { PaymentOptions } from './components/PaymentOptions';

// User UPI QR Code Components
export { default as UPIQRCode } from './components/UPIQRCode/UPIQRCode';

// How To Use Components
export { TutorialVideosView as UserHowToUse } from '@/features/HowToUse';

// Re-export hooks and utilities
export * from './components/UserDashboard/UserDashboard.hooks';
// Note: Other component hooks are empty and will be implemented as needed





