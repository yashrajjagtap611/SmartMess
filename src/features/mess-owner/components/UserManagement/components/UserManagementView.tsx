import React from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useNavigate } from 'react-router-dom';
import { handleLogout as logoutUtil } from '@/utils/logout';
import { Button } from '@/components/ui/button';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '@/constants/routes';

// Import subcomponents

import FilterModal from '@/components/common/FilterModal/FilterModal';
import AlphabetScroll from './AlphabetScroll';
import ViewModeToggle from './ViewModeToggle';
import FilterSummary from './FilterSummary';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import UserCard from './UserCard';
import UserTableRow from './UserTableRow';
// import UserDetailModal from './UserDetailModal'; // Removed - now using dedicated page route
import { CommonHeader } from '@/components/common/Header/CommonHeader';

// Import constants
import { FILTER_OPTIONS, ALPHABET } from '../UserManagement.utils';
import type { UserManagementViewProps } from '../UserManagement.types';

const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  loading,
  error,
  searchQuery,
  selectedFilter,
  viewMode,
  isMobile,
  selectedLetter,
  scrollbarPosition,
  isScrolling,
  isFilterModalOpen,
  showSearch,
  filteredUsers,
  groupedUsers,
  // selectedUser, // Removed - not needed for page navigation
  // isUserDetailModalOpen, // Removed - not needed for page navigation
  userListRef,
  tableBodyRef,
  setSearchQuery,
  setSelectedFilter,
  setViewMode,
  setIsFilterModalOpen,
  setShowSearch,
  handleLetterSelect,
  handleUserClick,
  // setIsUserDetailModalOpen, // Removed - not needed for page navigation
  // handleUpdateUserStatus, // Removed - handled on detail page
  // handleUpdatePaymentStatus, // Removed - handled on detail page
  // handleRemoveUser, // Removed - handled on detail page
  // handleUpdateUserPlan, // Removed - handled on detail page
}) => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  // Update filter options with selected state and counts
  const filterOptions = FILTER_OPTIONS.map(option => {
    let count = 0;
    switch (option.id) {
      case 'all':
        count = users.length;
        break;
      case 'active':
        count = users.filter(u => u.isActive).length;
        break;
      case 'inactive':
        count = users.filter(u => !u.isActive).length;
        break;
      case 'pending':
        count = users.filter(u => u.paymentStatus === 'Pending').length;
        break;
      case 'overdue':
        count = users.filter(u => u.paymentStatus === 'Overdue').length;
        break;
    }
    return {
      ...option,
      selected: selectedFilter === option.id,
      count
    };
  });

  return (
    <>
      <style>
        {`
          @keyframes flash-highlight {
            0%, 100% { 
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 8px 25px rgba(26, 95, 99, 0.3);
              transform: scale(1.02);
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        
        <div className="lg:ml-90 transition-all duration-300 relative pb-24 lg:pb-0">
          {/* Header */}
          <CommonHeader
            title="User Management"
            subtitle="Manage users, plans, and payments"
            searchProps={{
              searchQuery,
              onSearchChange: setSearchQuery,
              showSearch,
              onToggleSearch: () => setShowSearch(!showSearch),
              onFilterClick: () => setIsFilterModalOpen(true),
            }}
            variant="search"
          >
            {/* Show button in header on large screens only */}
            <div className="hidden lg:block">
              <Button
                onClick={() => navigate(ROUTES.MESS_OWNER.JOIN_REQUESTS)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Join Requests
              </Button>
            </div>
          </CommonHeader>

          {/* View Mode Toggle - Fixed position outside scrollable area */}
          {!loading && !error && (
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isMobile={isMobile}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 p-3 sm:p-4 pb-20 relative lg:pt-32 overflow-y-auto scrollbar-hide" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            <div className="mr-8 p-3 lg:mr-16">
              {/* Loading State */}
              {loading && <LoadingState />}

              {/* Error State */}
              {error && !loading && <ErrorState error={error} />}

              {/* Content when not loading and no error */}
              {!loading && !error && (
                <>
                  {/* Filter Summary */}
                  <FilterSummary
                    selectedFilter={selectedFilter}
                    onClearFilter={() => setSelectedFilter('all')}
                    filterOptions={filterOptions}
                  />

                  {/* User List */}
                  <div className="">
                    {/* Cards View - Mobile, Tablet, and Large Devices (when selected) */}
                    <div 
                      ref={userListRef}
                      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${viewMode === 'cards' ? 'block' : 'lg:hidden'}`}
                    >
                      {Object.entries(groupedUsers).map(([, usersInGroup]) => (
                        usersInGroup.map((user, index) => (
                          <UserCard 
                            key={user.id} 
                            user={user} 
                            index={index}
                            isScrolling={isScrolling}
                            selectedLetter={selectedLetter}
                            onUserClick={handleUserClick}
                          />
                        ))
                      ))}
                    </div>

                    {/* Table View - Large Devices Only (when selected) */}
                    <div 
                      className={`hidden ${viewMode === 'table' ? 'lg:block' : 'lg:hidden'} bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden shadow-sm h-96 lg:h-[calc(100vh-100px)] xl:h-[calc(100vh-140px)]`} 
                      id="table-container"
                    >
                      {/* Table Header */}
                      <div className="bg-SmartMess-light-accent dark:SmartMess-dark-accent dark:bg-SmartMess-light-accent dark:SmartMess-dark-accent/20 px-4 py-3 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border sticky top-0 z-10">
                        <div className="flex items-center text-sm font-semibold text-SmartMess-light-text dark:SmartMess-dark-text-secondary dark:text-SmartMess-light-text dark:SmartMess-dark-text-secondary">
                          <div className="flex-1">USER</div>
                          <div className="w-24 lg:w-40 text-center">PLAN</div>
                          <div className="w-20 lg:w-30 text-center">MEALS LEFT</div>
                          <div className="w-24 lg:w-40 text-center">PAYMENT STATUS</div>
                          <div className="w-20 lg:w-30 text-right">AMOUNT DUE</div>
                          <div className="w-12 lg:w-20 text-center">ACTIONS</div>
                        </div>
                      </div>
                      
                      {/* Table Body - Scrollable */}
                      <div 
                        ref={tableBodyRef}
                        className="overflow-y-auto scrollbar-hide h-96 lg:h-[calc(100vh-100px)] xl:h-[calc(100vh-240px)] flex flex-col"
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          WebkitOverflowScrolling: 'touch'
                        }}
                        id="table-body-scrollable"
                      >
                        <div className="flex-1">
                          {Object.entries(groupedUsers).map(([, usersInGroup]) => (
                            usersInGroup.map((user) => (
                              <UserTableRow 
                                key={user.id} 
                                user={user} 
                                index={0}
                                isScrolling={isScrolling}
                                selectedLetter={selectedLetter}
                                onUserClick={handleUserClick}
                              />
                            ))
                          ))}
                        </div>
                      </div>
                    
                      {/* Empty State */}
                      {filteredUsers.length === 0 && (
                        <EmptyState
                          searchQuery={searchQuery}
                          onClearFilters={() => {
                            setSearchQuery('');
                            setSelectedFilter('all');
                          }}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Alphabetical Scroll Bar */}
          <AlphabetScroll
            alphabet={ALPHABET}
            groupedUsers={groupedUsers}
            selectedLetter={selectedLetter}
            onLetterSelect={handleLetterSelect}
            scrollbarPosition={scrollbarPosition}
            isMobile={isMobile}
          />

          {/* Filter Modal */}
          <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            selectedFilter={selectedFilter}
            onFilterChange={(filterId) => setSelectedFilter(filterId as typeof selectedFilter)}
            filterOptions={filterOptions}
            title="Filter Users"
            showCounts={true}
          />

          {/* User Detail Modal - REMOVED: Now using dedicated page route */}
          {/* Users will navigate to /mess-owner/user-management/:userId instead */}
        </div>

        {/* Floating Action Button for Join Requests - Mobile Only */}
        <button
          onClick={() => navigate(ROUTES.MESS_OWNER.JOIN_REQUESTS)}
          className="lg:hidden fixed bottom-20 right-4 z-50 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl active:shadow-2xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Join Requests"
          title="Join Requests"
        >
          <UserPlusIcon className="w-6 h-6" />
          {/* Badge indicator */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
            <span className="animate-pulse">!</span>
          </span>
        </button>

        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>
    </>
  );
};

export default UserManagementView;
