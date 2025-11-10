import React, { useState } from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useNavigate } from 'react-router-dom';
import { handleLogout as logoutUtil } from '@/utils/logout';
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { Button } from '@/components/ui/button';
import { FunnelIcon } from '@heroicons/react/24/outline';
import JoinRequestsSection from '../../UserManagement/components/JoinRequestsSection';
import FilterModal, { type FilterOption } from '@/components/common/FilterModal';
import { ClockIcon, CheckCircleIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import type { JoinRequest } from '../../UserManagement/UserManagement.types';

interface JoinRequestsViewProps {
  joinRequests: JoinRequest[];
  loading: boolean;
  handleApproveJoinRequest: (notificationId: string, remarks?: string) => Promise<void>;
  handleRejectJoinRequest: (notificationId: string, remarks?: string) => Promise<void>;
  refreshJoinRequests: () => Promise<void>;
}

const JoinRequestsView: React.FC<JoinRequestsViewProps> = ({
  joinRequests,
  loading,
  handleApproveJoinRequest,
  handleRejectJoinRequest,
  refreshJoinRequests,
}) => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  // Count requests by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      all: joinRequests?.length || 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    joinRequests?.forEach(request => {
      const status = (request.status || '').toLowerCase().trim();
      if (status === 'pending') {
        counts.pending++;
      } else if (status === 'approved') {
        counts.approved++;
      } else if (status === 'rejected') {
        counts.rejected++;
      }
    });
    
    return counts;
  }, [joinRequests]);

  // Filter options for the modal
  const filterOptions: FilterOption[] = React.useMemo(() => [
    {
      id: 'all',
      title: 'All Requests',
      description: 'View all join requests',
      icon: UserPlusIcon,
      selected: filterStatus === 'all',
      count: statusCounts.all
    },
    {
      id: 'pending',
      title: 'Pending',
      description: 'Requests awaiting your approval',
      icon: ClockIcon,
      selected: filterStatus === 'pending',
      count: statusCounts.pending
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Requests you have approved',
      icon: CheckCircleIcon,
      selected: filterStatus === 'approved',
      count: statusCounts.approved
    },
    {
      id: 'rejected',
      title: 'Rejected',
      description: 'Requests you have rejected',
      icon: XMarkIcon,
      selected: filterStatus === 'rejected',
      count: statusCounts.rejected
    }
  ], [filterStatus, statusCounts]);

  // Filter requests based on selected status
  const filteredRequests = React.useMemo(() => {
    if (!joinRequests || joinRequests.length === 0) return [];
    
    if (filterStatus === 'all') return joinRequests;
    
    return joinRequests.filter(request => {
      const requestStatus = (request.status || '').toLowerCase().trim();
      const filterStatusLower = filterStatus.toLowerCase().trim();
      return requestStatus === filterStatusLower;
    });
  }, [joinRequests, filterStatus]);

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      
      <div className="lg:ml-90 transition-all duration-300 relative pb-24 lg:pb-0">
        {/* Header */}
        <CommonHeader
          title="Join Requests"
          subtitle="Review and manage new user join requests"
          variant="default"
        >
          <Button
            variant="outline"
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </CommonHeader>

        {/* Main Content */}
        <div className="flex-1 p-3 pb-20 relative  overflow-y-auto scrollbar-hide" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div className="p-3">
            <JoinRequestsSection
              requests={filteredRequests}
              loading={loading}
              onApprove={handleApproveJoinRequest}
              onReject={handleRejectJoinRequest}
              onRefresh={refreshJoinRequests}
              filterStatus={filterStatus}
            />
          </div>
        </div>
      </div>

      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedFilter={filterStatus}
        onFilterChange={(filterId) => {
          setFilterStatus(filterId as 'all' | 'pending' | 'approved' | 'rejected');
          setIsFilterModalOpen(false);
        }}
        filterOptions={filterOptions}
        title="Filter Join Requests"
        showCounts={true}
      />
    </div>
  );
};

export default JoinRequestsView;

