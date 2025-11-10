import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Users, Home, Settings, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeaveStats from './LeaveStats';
import LeaveRequestList from './LeaveRequestList';
import MessOffDayList from './MessOffDayList';
import DefaultOffDaySettings from './DefaultOffDaySettings';
import { useLeaveManagement } from '../LeaveManagement.hooks';
import type { DefaultOffDaySettings as DefaultOffDaySettingsType } from '../LeaveManagement.types';

const LeaveManagementContent: React.FC = () => {
  const {
    leaveRequests,
    loading,
    error,
    stats,
    pagination,
    filters,
    processLeaveRequest,
    processExtensionRequest,
    updateFilters,
    loadLeaveRequests,
    // Mess off day functionality
    messOffDayRequests,
    messOffDayStats,
    messOffDayPagination,
    defaultOffDaySettings,
    updateMessOffDay: _updateMessOffDay, // Used by hook for future edit functionality
    deleteMessOffDay,
    loadMessOffDayRequests,
    loadDefaultOffDaySettings: _loadDefaultOffDaySettings, // Used by hook for loading settings
    saveDefaultOffDaySettings
  } = useLeaveManagement();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL, default to 'leaves'
  const urlTab = searchParams.get('tab');
  const activeTab = (urlTab && ['leaves', 'mess-off-days', 'settings'].includes(urlTab)) 
    ? (urlTab as 'leaves' | 'mess-off-days' | 'settings')
    : 'leaves';
  
  // Initialize URL with default tab if not present
  useEffect(() => {
    if (!urlTab) {
      setSearchParams({ tab: 'leaves' }, { replace: true });
    }
  }, [urlTab, setSearchParams]);
  
  // Handle tab change - update URL
  const handleTabChange = (newTab: 'leaves' | 'mess-off-days' | 'settings') => {
    setSearchParams({ tab: newTab }, { replace: true });
  };
  
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentPage = pagination?.current || 1;
      loadLeaveRequests(currentPage, filters);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadLeaveRequests, pagination, filters]);

  const handleViewDetails = (request: any) => {
    // Navigate to dedicated page view
    navigate(ROUTES.MESS_OWNER.LEAVE_DETAILS.replace(':leaveId', request._id));
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'info', message: '' });
    }, 5000);
  };

  const handleProcessRequest = async (requestId: string, action: any) => {
    const result = await processLeaveRequest(requestId, action);
    if (result.success) {
      showNotification('success', result.message || 'Request processed successfully!');
    } else {
      showNotification('error', result.message || 'Failed to process request');
    }
    return result;
  };

  const handleProcessExtensionRequest = async (requestId: string, extensionId: string, action: any) => {
    const result = await processExtensionRequest(requestId, extensionId, action);
    if (result.success) {
      showNotification('success', result.message || 'Extension request processed successfully!');
    } else {
      showNotification('error', result.message || 'Failed to process extension request');
    }
    return result;
  };

  const handleFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
    loadLeaveRequests(1, { ...filters, ...newFilters });
  };

  const handlePageChange = (page: number) => {
    loadLeaveRequests(page, filters);
  };

  // Mess off day handlers - removed as form is now on separate page

  const handleDeleteMessOffDay = async (requestId: string, announcementData?: { sendAnnouncement?: boolean; announcementMessage?: string }) => {
    const result = await deleteMessOffDay(requestId, announcementData);
    if (result.success) {
      showNotification('success', result.message || 'Mess off day cancelled successfully!');
    } else {
      showNotification('error', result.message || 'Failed to cancel mess off day');
    }
    return result;
  };

  const handleMessOffDayFilterChange = (newFilters: any) => {
    loadMessOffDayRequests(1, newFilters);
  };

  const handleMessOffDayPageChange = (page: number) => {
    loadMessOffDayRequests(page);
  };

  const handleSaveDefaultSettings = async (settings: Partial<DefaultOffDaySettingsType>) => {
    const result = await saveDefaultOffDaySettings(settings);
    if (result.success) {
      showNotification('success', result.message || 'Default settings saved successfully!');
    } else {
      showNotification('error', result.message || 'Failed to save default settings');
    }
  };
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Leave Management</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm sm:max-w-md ${
          notification.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">{notification.message}</p>
            <button
              onClick={() => setNotification({ show: false, type: 'info', message: '' })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 sm:p-6 pb-[72px] sm:pb-6 lg:pb-4 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'leaves' | 'mess-off-days' | 'settings')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="leaves"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Member Leaves</span>
              <span className="sm:hidden">Leaves</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mess-off-days"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Mess Off Days</span>
              <span className="sm:hidden">Off Days</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Default Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>
          {/* Member Leaves Tab */}
          <TabsContent value="leaves" className="space-y-6">
            {/* Statistics */}
            <div>
              <h2 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">Leave Request Statistics</h2>
              <LeaveStats stats={stats} />
            </div>

            {/* Leave Requests */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Leave Requests</h2>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <LeaveRequestList
                    leaveRequests={leaveRequests}
                    loading={loading}
                    error={error}
                    onProcessRequest={handleProcessRequest}
                    onProcessExtensionRequest={handleProcessExtensionRequest}
                    onViewDetails={handleViewDetails}
                    onFilterChange={handleFilterChange}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mess Off Days Tab */}
          <TabsContent value="mess-off-days" className="space-y-6">
            {/* Mess Off Day Statistics */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Mess Off Day Statistics</h2>
                <button
                  onClick={() => navigate(ROUTES.MESS_OWNER.MESS_OFF_DAY_FORM)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Request Off Day</span>
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Off Days', value: messOffDayStats?.total || 0, color: 'bg-blue-500' },
                  { title: 'This Week', value: messOffDayStats?.thisWeek || 0, color: 'bg-yellow-500' },
                  { title: 'This Month', value: messOffDayStats?.thisMonth || 0, color: 'bg-green-500' },
                  { title: 'Upcoming', value: messOffDayStats?.upcoming || 0, color: 'bg-purple-500' }
                ].map((stat, index) => (
                  <div key={index} className="SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg p-4 border SmartMess-light-border dark:SmartMess-dark-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">{stat.title}</p>
                        <p className="text-lg sm:text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-2 rounded-lg`}>
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mess Off Day Requests */}
            <div>
              <h2 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">Mess Off Day Requests</h2>
              <MessOffDayList
                offDayRequests={messOffDayRequests || []}
                loading={loading}
                error={error}
                onDeleteRequest={handleDeleteMessOffDay}
                onViewDetails={() => {}} // TODO: Implement view details
                onFilterChange={handleMessOffDayFilterChange}
                pagination={messOffDayPagination || { current: 1, pages: 1, total: 0 }}
                onPageChange={handleMessOffDayPageChange}
              />
            </div>
          </TabsContent>

          {/* Default Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">Default Off Day Settings</h2>
              <DefaultOffDaySettings
                settings={defaultOffDaySettings}
                onSave={handleSaveDefaultSettings}
                isLoading={loading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal removed in favor of route-based details page */}
    </div>
  );
};

export default LeaveManagementContent;