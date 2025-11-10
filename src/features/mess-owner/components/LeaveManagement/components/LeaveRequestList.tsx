import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Search,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  List,
  CalendarDays,
  CalendarRange,
  RefreshCw,
  X
} from 'lucide-react';
import { MultiSelectFilterModal, type FilterSection } from '@/components/common/FilterModal';
import type { LeaveRequest, LeaveRequestAction, ExtensionRequestAction } from '../LeaveManagement.types';
import { formatDate, getStatusColor, getStatusBadge } from '../LeaveManagement.utils';

interface LeaveRequestListProps {
  leaveRequests: LeaveRequest[];
  loading: boolean;
  error: string | null;
  onProcessRequest: (requestId: string, action: LeaveRequestAction) => Promise<{ success: boolean; message: string }>;
  onProcessExtensionRequest: (requestId: string, extensionId: string, action: ExtensionRequestAction) => Promise<{ success: boolean; message: string }>;
  onViewDetails: (request: LeaveRequest) => void;
  onFilterChange: (filters: any) => void;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({
  leaveRequests,
  loading,
  error,
  onProcessRequest,
  onProcessExtensionRequest,
  onViewDetails,
  onFilterChange,
  pagination,
  onPageChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    status: ['all'],
    date: ['all']
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showExtensionModal, setShowExtensionModal] = useState<{
    show: boolean;
    request: LeaveRequest | null;
    extension: any;
  }>({ show: false, request: null, extension: null });

  const handleFilterChange = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
    
    // Convert multi-select filters to filter object
    const statusFilters = filters['status'] || ['all'];
    const dateFilters = filters['date'] || ['all'];
    
    const filterObj: any = {};
    
    // Handle status filters
    if (!statusFilters.includes('all') && statusFilters.length > 0) {
      filterObj.status = statusFilters.length === 1 ? statusFilters[0] : statusFilters;
    }
    
    // Handle date filters
    if (!dateFilters.includes('all') && dateFilters.length > 0) {
      filterObj.dateFilter = dateFilters.length === 1 ? dateFilters[0] : dateFilters;
    }
    
    onFilterChange(filterObj);
  };

  // Filter sections for multi-select modal
  const filterSections: FilterSection[] = [
    {
      id: 'status',
      title: 'Status',
      options: [
        {
          id: 'all',
          title: 'All Status',
          description: 'Show all leave requests',
          icon: List,
          selected: false
        },
        {
          id: 'pending',
          title: 'Pending',
          description: 'Requests awaiting approval',
          icon: Clock,
          selected: false
        },
        {
          id: 'approved',
          title: 'Approved',
          description: 'Approved leave requests',
          icon: CheckCircle,
          selected: false
        },
        {
          id: 'rejected',
          title: 'Rejected',
          description: 'Rejected leave requests',
          icon: XCircle,
          selected: false
        },
        {
          id: 'cancelled',
          title: 'Cancelled',
          description: 'Cancelled leave requests',
          icon: XCircle,
          selected: false
        }
      ]
    },
    {
      id: 'date',
      title: 'Date Range',
      options: [
        {
          id: 'all',
          title: 'All Dates',
          description: 'Show all dates',
          icon: Calendar,
          selected: false
        },
        {
          id: 'today',
          title: 'Today',
          description: 'Leave requests for today',
          icon: CalendarDays,
          selected: false
        },
        {
          id: 'week',
          title: 'This Week',
          description: 'Leave requests for this week',
          icon: CalendarRange,
          selected: false
        },
        {
          id: 'month',
          title: 'This Month',
          description: 'Leave requests for this month',
          icon: Calendar,
          selected: false
        }
      ]
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onFilterChange({ search: query });
  };

  const handleRefresh = () => {
    const currentPage = pagination?.current || 1;
    onPageChange(currentPage);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchInput(false);
    onFilterChange({ search: '' });
  };

  const handleApprove = async (requestId: string) => {
    setProcessingRequest(requestId);
    await onProcessRequest(requestId, { action: 'approve' });
    setProcessingRequest(null);
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      setProcessingRequest(requestId);
      await onProcessRequest(requestId, { action: 'reject', rejectionReason: reason });
      setProcessingRequest(null);
    }
  };

  const handleApproveExtension = async (requestId: string, extensionId: string) => {
    setProcessingRequest(extensionId);
    await onProcessExtensionRequest(requestId, extensionId, { action: 'approve' });
    setProcessingRequest(null);
    setShowExtensionModal({ show: false, request: null, extension: null });
  };

  const handleRejectExtension = async (requestId: string, extensionId: string) => {
    const reason = prompt('Please provide a reason for rejecting the extension:');
    if (reason && reason.trim()) {
      setProcessingRequest(extensionId);
      await onProcessExtensionRequest(requestId, extensionId, { action: 'reject', rejectionReason: reason });
      setProcessingRequest(null);
      setShowExtensionModal({ show: false, request: null, extension: null });
    }
  };

  const openExtensionModal = (request: LeaveRequest, extension: any) => {
    setShowExtensionModal({ show: true, request, extension });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading leave requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Requests</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (leaveRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Leave Requests</h3>
        <p className="text-gray-600 dark:text-gray-400">No leave requests found for the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search Input - Show when search icon is clicked */}
        {showSearchInput ? (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by member name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <>
            {/* Search Icon Button */}
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-2 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg bg-white dark:bg-SmartMess-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Filter Icon Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="p-2 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg bg-white dark:bg-SmartMess-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative"
              title="Filter"
            >
              <Filter className="h-5 w-5" />
              {/* Badge showing if filters are active */}
              {(() => {
                const statusFilters = selectedFilters['status'] || ['all'];
                const dateFilters = selectedFilters['date'] || ['all'];
                const hasActiveFilters = !statusFilters.includes('all') || !dateFilters.includes('all');
                return hasActiveFilters ? (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
                ) : null;
              })()}
            </button>

            {/* Refresh Icon Button */}
            <button
              onClick={handleRefresh}
              className="p-2 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg bg-white dark:bg-SmartMess-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Request Cards */}
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-4 min-w-full">
          {leaveRequests.map((request) => {
            const isAutoApproved = request.status === 'approved' && !request.approvedBy;
            const totalMealsMissed = (request as any).totalMealsMissed ?? 0;
            
            return (
              <div
                key={request._id}
                className="bg-white dark:bg-SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Open leave request details"
                onClick={() => onViewDetails(request)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetails(request); } }}
              >
                {/* Header: Status, Name, and Actions */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {(() => {
                        const label = isAutoApproved ? 'Auto-approved' : getStatusBadge(request.status);
                        return (
                          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                            {label}
                          </div>
                        );
                      })()}
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {request.userId.firstName} {request.userId.lastName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                        {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(request._id); }}
                        disabled={processingRequest === request._id}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReject(request._id); }}
                        disabled={processingRequest === request._id}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Meal Plans and Meals Missed */}
                <div className="mb-3">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Meal Plans */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MEAL PLANS</p>
                      {Array.isArray(request.mealPlanIds) && request.mealPlanIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {request.mealPlanIds.map((plan: any, i: number) => {
                            const name = plan?.name || plan?.planName || `Plan ${i + 1}`;
                            const mo = plan?.mealOptions || {};
                            const tags = [mo.breakfast && 'B', mo.lunch && 'L', mo.dinner && 'D'].filter(Boolean).join('/');
                            return (
                              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                <span>{name}</span>
                                {tags && <span className="text-blue-500 dark:text-blue-400">({tags})</span>}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">No plans</p>
                      )}
                    </div>
                    
                    {/* Meals Missed */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MEALS MISSED</p>
                      <div >
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalMealsMissed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                {request.reason && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">REASON</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{request.reason}</p>
                  </div>
                )}

                {/* Extension Requests */}
                {request.extensionRequests && request.extensionRequests.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">EXTENSION REQUESTS</p>
                    <div className="space-y-2">
                      {request.extensionRequests.map((extension) => (
                        <div key={extension._id} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                            {formatDate(extension.originalEndDate)} → {formatDate(extension.newEndDate)}
                          </span>
                          {extension.status === 'pending' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openExtensionModal(request, extension); }}
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => onPageChange(pagination.current - 1)}
            disabled={pagination.current === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {pagination.current} of {pagination.pages} ({pagination.total} total)
          </span>
          
          <button
            onClick={() => onPageChange(pagination.current + 1)}
            disabled={pagination.current === pagination.pages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Multi-Select Filter Modal */}
      <MultiSelectFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        filterSections={filterSections}
        title="Filter Leave Requests"
        showCounts={false}
      />

      {/* Extension Modal */}
      {showExtensionModal.show && showExtensionModal.request && showExtensionModal.extension && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-SmartMess-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Review Extension Request
            </h3>
            
            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Original End Date:</p>
              <p className="text-gray-900 dark:text-gray-100">{formatDate(showExtensionModal.extension.originalEndDate)}</p>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">New End Date:</p>
              <p className="text-gray-900 dark:text-gray-100">{formatDate(showExtensionModal.extension.newEndDate)}</p>
              
              {showExtensionModal.extension.reason && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Reason:</p>
                  <p className="text-gray-900 dark:text-gray-100">{showExtensionModal.extension.reason}</p>
                </>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExtensionModal({ show: false, request: null, extension: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-SmartMess-dark-accent rounded-lg hover:bg-gray-200 dark:hover:bg-SmartMess-dark-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectExtension(showExtensionModal.request!._id, showExtensionModal.extension._id)}
                disabled={processingRequest === showExtensionModal.extension._id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleApproveExtension(showExtensionModal.request!._id, showExtensionModal.extension._id)}
                disabled={processingRequest === showExtensionModal.extension._id}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestList;

