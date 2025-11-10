import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MessOwnerLayout from '@/layouts/MessOwnerLayout';
import MessOwnerDashboardContent from './MessOwnerDashboardContent';
import UserManagement from '../UserManagement/UserManagement';
import { MealManagement } from '../MealManagement';
import LeaveManagement from '../LeaveManagement/LeaveManagement';
import BillingPaymentsWrapper from '../BillingPayments/BillingPaymentsWrapper';
import FeedbackComplaints from '@/features/FeedbackComplaints';
import ReportsAnalytics from '../ReportsAnalytics/ReportsAnalytics';
import Settings from '../Settings';
import UserDetailsPage from '@/features/mess-owner/pages/UserDetailsPage';
import LeaveRequestDetailsPage from '../LeaveManagement/components/LeaveRequestDetailsPage';
import MessOffDayFormPage from '../LeaveManagement/components/MessOffDayFormPage';
import MessOwnerJoinRequests from '../JoinRequests/JoinRequests';
import { MessOwnerServices, MessOwnerHowToUse } from '@/features/mess-owner';
import { MessOwnerSubscription } from '@/features/mess-owner/components/PlatformSubscription';
import MessOwnerNotifications from '@/features/Notification/Notification';
import { ChatCommunity, ChatProvider } from '@/features/ChatCommunity';
import WithSubscriptionCheck from '@/components/common/WithSubscriptionCheck';

const MessOwnerDashboard: React.FC = () => {
  return (
    <MessOwnerLayout>
      <Routes>
        {/* Dashboard Home */}
        <Route path="/" element={<MessOwnerDashboardContent />} />
        
        {/* User Management Routes */}
        <Route path="/user-management" element={<WithSubscriptionCheck blockAccess={true}><UserManagement /></WithSubscriptionCheck>} />
        <Route path="/user-management/:userId" element={<WithSubscriptionCheck blockAccess={true}><UserDetailsPage /></WithSubscriptionCheck>} />
        
        {/* Meal Management */}
        <Route path="/meal-management" element={<WithSubscriptionCheck blockAccess={true}><MealManagement /></WithSubscriptionCheck>} />
        
        {/* Leave Management Routes */}
        <Route path="/leave-management" element={<WithSubscriptionCheck blockAccess={true}><LeaveManagement /></WithSubscriptionCheck>} />
        <Route path="/leave-management/:leaveId" element={<WithSubscriptionCheck blockAccess={true}><LeaveRequestDetailsPage /></WithSubscriptionCheck>} />
        <Route path="/leave-management/mess-off-day-form" element={<WithSubscriptionCheck blockAccess={true}><MessOffDayFormPage /></WithSubscriptionCheck>} />
        
        {/* Billing & Payments */}
        <Route path="/billing-payments" element={<WithSubscriptionCheck blockAccess={true}><BillingPaymentsWrapper /></WithSubscriptionCheck>} />
        
        {/* Feedback & Complaints */}
        <Route path="/feedback" element={<WithSubscriptionCheck blockAccess={true}><FeedbackComplaints /></WithSubscriptionCheck>} />
        
        {/* Reports & Analytics */}
        <Route path="/reports" element={<ReportsAnalytics />} />
        
        {/* Join Requests */}
        <Route path="/join-requests" element={<WithSubscriptionCheck blockAccess={true}><MessOwnerJoinRequests /></WithSubscriptionCheck>} />
        
        {/* Services / Ad Services */}
        <Route path="/services" element={<MessOwnerServices />} />
        <Route path="/ad-services" element={<MessOwnerServices />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<MessOwnerNotifications />} />
        
        {/* Platform Subscription */}
        <Route path="/platform-subscription" element={<MessOwnerSubscription />} />
        
        {/* Chat & Community */}
        <Route path="/chat" element={<WithSubscriptionCheck blockAccess={true}><ChatProvider><ChatCommunity /></ChatProvider></WithSubscriptionCheck>} />
        
        {/* Settings - Nested Routes */}
        <Route path="/settings/*" element={<Settings />} />
        
        {/* How to Use */}
        <Route path="/how-to-use" element={<MessOwnerHowToUse userRole="mess-owner" />} />
        
        {/* Fallback - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/mess-owner" replace />} />
      </Routes>
    </MessOwnerLayout>
  );
};

export default MessOwnerDashboard; 