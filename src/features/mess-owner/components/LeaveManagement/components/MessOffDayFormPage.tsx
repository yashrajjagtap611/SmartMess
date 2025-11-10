import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from "@/components/theme/theme-provider";
import { handleLogout as logoutUtil } from "@/utils/logout";
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { useUser } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import MessOffDayForm from './MessOffDayForm';
import { useLeaveManagement } from '../LeaveManagement.hooks';
import type { MessOffDayFormData } from '../LeaveManagement.types';
import { useToast } from '@/hooks/use-toast';

const MessOffDayFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { user } = useUser();
  const { toast } = useToast();
  
  const editId = searchParams.get('edit');
  const [editingMessOffDay, setEditingMessOffDay] = useState<any>(null);
  const [loading, setLoading] = useState(!!editId);
  
  const {
    updateMessOffDay,
    createMessOffDayRequest
  } = useLeaveManagement();

  const handleLogout = () => {
    logoutUtil(window.location.href);
  };

  // Load editing data if editId is provided
  useEffect(() => {
    if (editId) {
      const loadEditData = async () => {
        setLoading(true);
        try {
          // Load the specific mess off day request
          const { leaveManagementAPI } = await import('../apiService');
          const response = await leaveManagementAPI.getMessOffDayById(editId);
          if (response.success && response.data) {
            setEditingMessOffDay(response.data);
          } else {
            toast({
              title: 'Error',
              description: 'Mess off day request not found',
              variant: 'destructive',
            });
            navigate(ROUTES.MESS_OWNER.LEAVE);
          }
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to load mess off day request',
            variant: 'destructive',
          });
          navigate(ROUTES.MESS_OWNER.LEAVE);
        } finally {
          setLoading(false);
        }
      };
      loadEditData();
    }
  }, [editId, navigate, toast]);

  const handleSubmit = async (formData: MessOffDayFormData) => {
    try {
      let result;
      if (editingMessOffDay) {
        result = await updateMessOffDay(editingMessOffDay._id || editingMessOffDay.id, formData);
      } else {
        result = await createMessOffDayRequest(formData);
      }
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || (editingMessOffDay ? 'Mess off day updated successfully!' : 'Mess off day request created successfully!'),
          variant: 'default',
        });
        navigate(ROUTES.MESS_OWNER.LEAVE);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to save mess off day',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save mess off day',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.MESS_OWNER.LEAVE);
  };

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
            title={editingMessOffDay ? "Edit Mess Off Day" : "Create Mess Off Day"}
            subtitle="Loading..."
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
            onBack={handleCancel}
          />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
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

  const initialData = editingMessOffDay ? {
    offDate: editingMessOffDay.offDate?.split('T')[0] || '',
    reason: editingMessOffDay.reason || '',
    mealTypes: editingMessOffDay.mealTypes || ['breakfast', 'lunch', 'dinner'],
    billingDeduction: editingMessOffDay.billingDeduction || false,
    subscriptionExtension: editingMessOffDay.subscriptionExtension || false,
    extensionDays: editingMessOffDay.extensionDays || 0,
    startDate: editingMessOffDay.startDate?.split('T')[0] || '',
    endDate: editingMessOffDay.endDate?.split('T')[0] || '',
    startDateMealTypes: editingMessOffDay.startDateMealTypes || ['breakfast', 'lunch', 'dinner'],
    endDateMealTypes: editingMessOffDay.endDateMealTypes || ['breakfast', 'lunch', 'dinner'],
    sendAnnouncement: editingMessOffDay.sendAnnouncement ?? true,
    announcementMessage: editingMessOffDay.announcementMessage || ''
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="flex-1">
        <CommonHeader
          title={editingMessOffDay ? "Edit Mess Off Day" : "Create Mess Off Day"}
          subtitle={editingMessOffDay ? "Update mess off day details" : "Request a new mess off day"}
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
          onBack={handleCancel}
        />
        <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
          <MessOffDayForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={initialData}
            isLoading={false}
          />
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

export default MessOffDayFormPage;

