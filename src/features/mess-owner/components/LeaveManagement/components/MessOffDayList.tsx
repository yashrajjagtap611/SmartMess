import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Settings,
  Coffee,
  Sun,
  Moon,
  AlertTriangle,
  X,
  Eye
} from 'lucide-react';
import type { MessOffDayRequest } from '../LeaveManagement.types';
import { formatDate } from '../LeaveManagement.utils';

// Group consecutive dates with same reason and similar creation time
interface GroupedOffDay {
  type: 'single' | 'range';
  entries: MessOffDayRequest[];
  startDate: Date;
  endDate: Date;
  reason: string;
  mealTypes: Set<string>;
}

const groupConsecutiveOffDays = (requests: MessOffDayRequest[]): GroupedOffDay[] => {
  if (requests.length === 0) return [];

  // Sort by date
  const sorted = [...requests].sort((a, b) => 
    new Date(a.offDate).getTime() - new Date(b.offDate).getTime()
  );

  const groups: GroupedOffDay[] = [];
  let currentGroup: MessOffDayRequest[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (!current) continue;

    // If this item is a stored range, add it directly as a single group
    if ((current as any).rangeStartDate && (current as any).rangeEndDate) {
      groups.push({
        type: 'range',
        entries: [current],
        startDate: new Date((current as any).rangeStartDate),
        endDate: new Date((current as any).rangeEndDate),
        reason: current.reason,
        mealTypes: new Set(current.mealTypes)
      });
      currentGroup = [];
      continue;
    }
    
    const prev = i > 0 ? sorted[i - 1] : undefined;

    // Check if this should be grouped with previous
    const shouldGroup = prev && (
      // Same reason
      current.reason === prev.reason &&
      // Same status (don't mix cancelled with active)
      ((current as any).status || 'active') === ((prev as any).status || 'active') &&
      // Consecutive dates (1 day apart)
      Math.abs(
        new Date(current.offDate).getTime() - new Date(prev.offDate).getTime()
      ) === 86400000 // 1 day in milliseconds
    );

    if (shouldGroup && currentGroup.length > 0) {
      currentGroup.push(current);
    } else {
      // Start new group
      if (currentGroup.length > 0 && currentGroup[0]) {
        const firstEntry = currentGroup[0];
        const lastEntry = currentGroup[currentGroup.length - 1];
        if (firstEntry && lastEntry) {
          groups.push({
            type: currentGroup.length > 1 ? 'range' : 'single',
            entries: [...currentGroup],
            startDate: new Date(firstEntry.offDate),
            endDate: new Date(lastEntry.offDate),
            reason: firstEntry.reason,
            mealTypes: new Set(currentGroup.flatMap(e => e.mealTypes))
          });
        }
      }
      currentGroup = [current];
    }
  }

  // Add last group
  if (currentGroup.length > 0 && currentGroup[0]) {
    const firstEntry = currentGroup[0];
    const lastEntry = currentGroup[currentGroup.length - 1];
    if (firstEntry && lastEntry) {
      groups.push({
        type: currentGroup.length > 1 ? 'range' : 'single',
        entries: currentGroup,
        startDate: new Date(firstEntry.offDate),
        endDate: new Date(lastEntry.offDate),
        reason: firstEntry.reason,
        mealTypes: new Set(currentGroup.flatMap(e => e.mealTypes))
      });
    }
  }

  return groups;
};

interface MessOffDayListProps {
  offDayRequests: MessOffDayRequest[];
  loading: boolean;
  error: string | null;
  onDeleteRequest: (requestId: string, announcementData?: { sendAnnouncement?: boolean; announcementMessage?: string }) => Promise<{ success: boolean; message: string }>;
  onViewDetails: (request: MessOffDayRequest) => void;
  onFilterChange: (filters: any) => void;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

const MessOffDayList: React.FC<MessOffDayListProps> = ({
  offDayRequests,
  loading,
  error,
  onDeleteRequest,
  onViewDetails,
  onFilterChange,
  pagination,
  onPageChange
}) => {
  const [] = useState<MessOffDayRequest | null>(null);
  const [cancelModal, setCancelModal] = useState<{
    show: boolean;
    request: MessOffDayRequest | null;
    group: GroupedOffDay | null;
  }>({ show: false, request: null, group: null });
  const [cancelAnnouncement, setCancelAnnouncement] = useState({
    sendAnnouncement: true,
    announcementMessage: ''
  });
  const [processing, setProcessing] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  const [historyModal, setHistoryModal] = useState<{ show: boolean; items: any[] }>(() => ({ show: false, items: [] }));
  // Locally track cancelled requests so we can keep showing the card with a cancelled state
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());

  // Group consecutive off days
  const groupedOffDays = useMemo(() => {
    return groupConsecutiveOffDays(offDayRequests);
  }, [offDayRequests]);

  const handleCancel = (request: MessOffDayRequest, group?: GroupedOffDay) => {
    setCancelModal({ show: true, request, group: group || null });
    setCancelAnnouncement({ sendAnnouncement: true, announcementMessage: '' });
  };

  const confirmCancel = async () => {
    if (!cancelModal.request) return;

    setProcessing(true);
    try {
      const isRange = cancelModal.group && cancelModal.group.type === 'range';
      const entriesToCancel = isRange && cancelModal.group ? cancelModal.group.entries : [cancelModal.request];
      
      // For ranges, send announcement only once with the last delete request
      const announcementData = cancelAnnouncement.sendAnnouncement ? {
        sendAnnouncement: cancelAnnouncement.sendAnnouncement,
        ...(cancelAnnouncement.announcementMessage ? { announcementMessage: cancelAnnouncement.announcementMessage } : {}),
        ...(isRange && cancelModal.group ? {
          isRange: true,
          startDate: cancelModal.group.startDate.toISOString(),
          endDate: cancelModal.group.endDate.toISOString(),
          dayCount: cancelModal.group.entries.length
        } : {})
      } : undefined;

      // Cancel all entries in range, but send announcement only with the last one
      let lastResult;
      for (let i = 0; i < entriesToCancel.length; i++) {
        const entry = entriesToCancel[i];
        if (!entry) continue;
        
        const shouldSendAnnouncement = announcementData && i === entriesToCancel.length - 1;
        const dataForThisEntry = shouldSendAnnouncement ? announcementData : undefined;
        
        lastResult = await onDeleteRequest(entry._id, dataForThisEntry);
        
        if (!lastResult.success) {
          alert(lastResult.message || 'Failed to cancel off day');
          break;
        }
        // Mark as cancelled locally so the card stays visible with cancelled state
        setCancelledIds(prev => new Set(prev).add(entry._id));
      }
      
      if (lastResult?.success) {
        setCancelModal({ show: false, request: null, group: null });
        setCancelAnnouncement({ sendAnnouncement: true, announcementMessage: '' });
      }
    } catch (error) {
      alert('Failed to cancel off day request');
    } finally {
      setProcessing(false);
    }
  };

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter);
    onFilterChange({ dateFilter: filter === 'all' ? 'all' : filter });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2 text-gray-600 dark:text-SmartMess-dark-text-secondary">Loading mess off day requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-SmartMess-dark-text mb-2">Error Loading Requests</h3>
        <p className="text-gray-600 dark:text-SmartMess-dark-text-secondary">{error}</p>
      </div>
    );
  }

  if (offDayRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-SmartMess-dark-text mb-2">No Mess Off Day Requests</h3>
        <p className="text-gray-600 dark:text-SmartMess-dark-text-secondary">No mess off day requests found for the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-500 dark:text-SmartMess-dark-text-secondary" />
          <span className="text-sm text-gray-600 dark:text-SmartMess-dark-text-secondary">Filter by date:</span>
        </div>
        {['all', 'upcoming', 'past'].map((filter) => (
          <button
            key={filter}
            onClick={() => handleDateFilter(filter)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              dateFilter === filter
                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-SmartMess-dark-accent text-gray-600 dark:text-SmartMess-dark-text-secondary hover:bg-gray-200 dark:hover:bg-SmartMess-dark-hover'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Off Day Requests Grid */}
      <div className="grid gap-3 sm:gap-4">
        {groupedOffDays.map((group, groupIndex) => {
          const isUpcoming = group.startDate > new Date();
          const isPast = group.endDate < new Date();
          const isCancelledByStatus = group.entries.every(e => (e as any).status === 'cancelled');
          const isCancelledLocal = group.entries.every(e => cancelledIds.has(e._id));
          const isCancelled = isCancelledByStatus || isCancelledLocal;
          const displayDate = group.type === 'range' 
            ? `${formatDate(group.startDate.toISOString())} - ${formatDate(group.endDate.toISOString())}`
            : formatDate(group.startDate.toISOString());
          const dayCount = group.type === 'range' ? group.entries.length : 1;

          return (
          <div
            key={`group-${groupIndex}`}
            className={`rounded-lg border p-3 sm:p-4 md:p-6 transition-shadow SmartMess-light-border dark:SmartMess-dark-border ${isCancelled ? 'bg-red-50/40 dark:bg-red-900/10 border-red-200 dark:border-red-900/40' : 'SmartMess-light-surface dark:SmartMess-dark-surface hover:shadow-md'}`}
          >
            {/* Header: Date and Status */}
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3 flex-wrap">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-SmartMess-dark-text-secondary shrink-0" />
              <span className={`font-medium text-sm sm:text-base ${isCancelled ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-SmartMess-dark-text'}`}>
                {displayDate}
              </span>
              {group.type === 'range' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 whitespace-nowrap">
                  {dayCount} {dayCount === 1 ? 'day' : 'days'}
                </span>
              )}
              {isCancelled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 whitespace-nowrap">
                  Cancelled
                </span>
              ) : (
                <>
                  {isUpcoming && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400 whitespace-nowrap">Upcoming</span>
                  )}
                  {isPast && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-SmartMess-dark-accent text-gray-800 dark:text-SmartMess-dark-text whitespace-nowrap">Past</span>
                  )}
                </>
              )}
            </div>

            {/* Reason - Only show if exists */}
            {group.reason && group.reason.trim() && (
              <div className="mb-2.5 sm:mb-3">
                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-SmartMess-dark-text-secondary mb-0.5">Reason</p>
                <p className="text-xs sm:text-sm text-gray-900 dark:text-SmartMess-dark-text break-words line-clamp-2">{group.reason}</p>
              </div>
            )}

            {/* Affected Meals */}
            <div className="mb-2.5 sm:mb-3">
              <p className="text-[11px] sm:text-xs text-gray-600 dark:text-SmartMess-dark-text-secondary mb-1.5">Affected Meals</p>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {Array.from(group.mealTypes).map((mealType) => {
                  const getMealIcon = (type: string) => {
                    switch (type) {
                      case 'breakfast': return <Coffee className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
                      case 'lunch': return <Sun className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
                      case 'dinner': return <Moon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
                      default: return null;
                    }
                  };
                  
                  const getMealColor = (type: string) => {
                    switch (type) {
                      case 'breakfast': return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-400';
                      case 'lunch': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-400';
                      case 'dinner': return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-400';
                      default: return 'bg-gray-100 dark:bg-SmartMess-dark-accent text-gray-800 dark:text-SmartMess-dark-text';
                    }
                  };
                  
                  return (
                    <span
                      key={mealType}
                      className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 ${getMealColor(mealType)} text-[10px] sm:text-[11px] font-medium rounded-full`}
                    >
                      {getMealIcon(mealType)}
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Subscription Extension */}
            {group.entries[0] && (
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-SmartMess-dark-text-secondary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-SmartMess-dark-text-secondary leading-tight">Subscription Extension</p>
                  <p className={`text-[11px] sm:text-xs font-medium leading-tight ${group.entries[0].subscriptionExtension ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-SmartMess-dark-text-secondary'}`}>
                    {group.entries[0].subscriptionExtension ? 'Auto (based on missed meals)' : 'Disabled'}
                  </p>
                </div>
              </div>
            )}

            {/* Footer: Created Date and Action Buttons */}
            <div className="pt-2.5 sm:pt-3 border-t border-gray-200 dark:border-gray-700 mt-2.5 sm:mt-3">
              {group.entries[0] && (
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-SmartMess-dark-text-secondary mb-3">
                  Created: {formatDate(group.entries[0].createdAt)}
                </div>
              )}
              
              {/* Action Buttons - Only show if not cancelled */}
              {!isCancelled && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Cancel Button - Only show for upcoming dates */}
                  {isUpcoming && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (group.entries[0]) {
                          handleCancel(group.entries[0], group);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      title="Cancel mess off day"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  )}
                  
                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (group.entries[0]) {
                        onViewDetails(group.entries[0]);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="View details"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Details</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        })}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(pagination.current - 1)}
            disabled={pagination.current === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-SmartMess-dark-text-secondary bg-white dark:bg-SmartMess-dark-surface border border-gray-300 dark:border-SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700 dark:text-SmartMess-dark-text">
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            onClick={() => onPageChange(pagination.current + 1)}
            disabled={pagination.current === pagination.pages}
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-SmartMess-dark-text-secondary bg-white dark:bg-SmartMess-dark-surface border border-gray-300 dark:border-SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* History Modal */}
      {historyModal.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-SmartMess-dark-surface rounded-xl w-full max-w-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-SmartMess-dark-text">History</h3>
              <button onClick={() => setHistoryModal({ show: false, items: [] })} className="text-sm px-3 py-1 rounded bg-gray-100 dark:bg-gray-800">Close</button>
            </div>
            {historyModal.items.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No history available.</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {historyModal.items.map((h: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{new Date(h.at || h.createdAt).toLocaleString()}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-SmartMess-dark-text">Action: {h.action}</div>
                    {h.changes && (
                      <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">{JSON.stringify(h.changes, null, 2)}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Cancel Confirmation Modal with Announcement */}
      {cancelModal.show && cancelModal.request && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-SmartMess-dark-surface rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-SmartMess-dark-text">
                Cancel Mess Off Day{cancelModal.group && cancelModal.group.type === 'range' ? 's' : ''}
              </h3>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 dark:bg-SmartMess-dark-accent rounded-lg">
              <p className="text-gray-700 dark:text-SmartMess-dark-text-secondary mb-3 font-medium">
                Are you sure you want to cancel {cancelModal.group && cancelModal.group.type === 'range' ? `these ${cancelModal.group.entries.length} mess off days` : 'this mess off day'}?
              </p>
              <div className="space-y-2 text-sm">
                {cancelModal.group && cancelModal.group.type === 'range' ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Date Range:</span> {formatDate(cancelModal.group.startDate.toISOString())} - {formatDate(cancelModal.group.endDate.toISOString())}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Total Days:</span> {cancelModal.group.entries.length} days
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Date:</span> {formatDate(cancelModal.request.offDate)}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Meals:</span> {Array.from(cancelModal.group?.mealTypes || cancelModal.request.mealTypes || []).map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') || 'All meals'}
                </p>
                {cancelModal.request.reason && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Reason:</span> {cancelModal.request.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Announcement Section */}
            <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-sm mb-4">
              <label className="flex items-start gap-3 cursor-pointer group mb-3">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={cancelAnnouncement.sendAnnouncement}
                    onChange={(e) => setCancelAnnouncement(prev => ({ ...prev, sendAnnouncement: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-SmartMess-dark-surface peer-checked:bg-blue-600 peer-checked:border-blue-600 dark:peer-checked:bg-blue-500 dark:peer-checked:border-blue-500 transition-all duration-200 flex items-center justify-center group-hover:border-blue-400 dark:group-hover:border-blue-500">
                    {cancelAnnouncement.sendAnnouncement && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-SmartMess-dark-text group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Notify community about cancellation
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Send an announcement to the community chat about this cancellation
                  </p>
                </div>
              </label>
              
              {cancelAnnouncement.sendAnnouncement && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <label className="block text-xs font-medium text-gray-700 dark:text-SmartMess-dark-text mb-2">
                    Custom Message <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    value={cancelAnnouncement.announcementMessage}
                    onChange={(e) => setCancelAnnouncement(prev => ({ ...prev, announcementMessage: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-SmartMess-dark-text placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-200 text-sm font-mono"
                    placeholder={cancelModal.group && cancelModal.group.type === 'range' 
                      ? `Example format:\n\n✅ **Mess Closure Cancelled**\n\n📅 **Cancelled Date Range:** Monday, 3 November 2025 to Friday, 7 November 2025\n📊 **Total Days:** ${cancelModal.group.entries.length} days\n🍽️ **Meals:** Breakfast, Lunch, and Dinner\n\nGood news! The mess will be operational as usual during this period.`
                      : `Example format:\n\n✅ **Mess Closure Cancelled**\n\n📅 **Cancelled Date:** Monday, 3 November 2025\n🍽️ **Meals:** Breakfast, Lunch, and Dinner\n\nGood news! The mess will be operational as usual.`}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setCancelModal({ show: false, request: null, group: null });
                  setCancelAnnouncement({ sendAnnouncement: true, announcementMessage: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text bg-gray-100 dark:bg-SmartMess-dark-accent rounded-lg hover:bg-gray-200 dark:hover:bg-SmartMess-dark-hover transition-colors"
                disabled={processing}
              >
                Close
              </button>
              <button
                onClick={confirmCancel}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Cancel Off Day</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessOffDayList;
