import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CommonLayout from '@/layouts/CommonLayout';
import AdminDashboardContent from './AdminDashboardContent';
import UserManagement from '../UserManagement/UserManagement';
import MessOwnerManagement from '../MessOwnerManagement/MessOwnerManagement';
import SubscriptionManagement from '../PlatformSubscriptionManagement/SubscriptionManagement';
import BillingDashboard from '../BillingDashboard/BillingDashboard';
import SystemMonitoring from '../SystemMonitoring/SystemMonitoring';
import AdminSettings from '../AdminSettings/AdminSettings';
import AdminAdSettings from '../../../ADServices/Components/AdSettings';
import AdminProfile from '../AdminProfile/AdminProfile';
import { ROUTES } from '@/constants/routes';

const AdminDashboard: React.FC = () => {
  return (
    <CommonLayout>
      <Routes>
        <Route path="/" element={<AdminDashboardContent />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/mess-owners" element={<MessOwnerManagement />} />
        <Route path="/subscriptions" element={<SubscriptionManagement />} />
        <Route path="/billing" element={<BillingDashboard />} />
        <Route path="/system" element={<SystemMonitoring />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/ad-settings" element={<AdminAdSettings />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="*" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
      </Routes>
    </CommonLayout>
  );
};

export default AdminDashboard;