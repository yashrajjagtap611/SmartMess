import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from "@/components/theme/theme-provider";
import { handleLogout as logoutUtil } from "@/utils/logout";
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { useUser } from '@/contexts/AuthContext';
import { leaveManagementAPI } from '../apiService';
import LeaveRequestDetails from '../components/LeaveRequestDetails';
import type { LeaveRequest } from '../LeaveManagement.types';

const LeaveRequestDetailsPage: React.FC = () => {
  const { leaveId } = useParams();
  const navigate = useNavigate();
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<LeaveRequest | null>(null);

  const handleLogout = () => {
    logoutUtil(window.location.href);
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await leaveManagementAPI.getLeaveRequestById(String(leaveId));
        if (mounted) {
          if (resp?.success && resp.data) {
            setRequest(resp.data);
          } else {
            setError(resp?.message || 'Failed to load leave request');
          }
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load leave request');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (leaveId) run();
    return () => { mounted = false; };
  }, [leaveId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        <div className="flex-1">
          <CommonHeader
            title="Leave Request Details"
            subtitle="Loading leave request information..."
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leave request...</p>
            </div>
          </div>
        </div>
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        <div className="flex-1">
          <CommonHeader
            title="Leave Request Details"
            subtitle="Error loading leave request"
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
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || 'Leave request not found'}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="flex-1">
        <CommonHeader
          title="Leave Request Details"
          subtitle="Review and manage leave request details"
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
          onBack={() => navigate(-1)}
        />
        <div className="p-4 sm:p-6 pb-[72px] sm:pb-6 lg:pb-4">
          <LeaveRequestDetails request={request} variant="page" />
        </div>
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default LeaveRequestDetailsPage;


