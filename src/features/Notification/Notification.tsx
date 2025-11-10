import React, { useEffect, useState, useRef, useMemo } from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { useTheme } from '@/components/theme/theme-provider';
import messService from '@/services/api/messService';
import adminService from '@/services/api/adminService';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  InformationCircleIcon,
  MegaphoneIcon,
  FunnelIcon,
  EnvelopeIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import NotificationsSectionNew from '@/shared/notifications/NotificationsSectionNew';
import FilterModal, { FilterOption } from '@/components/common/FilterModal/FilterModal';
import InsufficientCreditsDialog from '@/components/common/InsufficientCreditsDialog';
import type { CommonNotification, NotificationAction } from '@/shared/notifications/types';

interface Notification {
  _id?: string;
  id: string;
  type:
    | 'join_request'
    | 'payment_received'
    | 'leave_request'
    | 'bill_due'
    | 'meal_plan_change'
    | 'general'
    | 'subscription_request'
    | 'payment_request';
  title: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  data?: any;
  isRead: boolean;
}

const Notification: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const userRole = authService.getCurrentUserRole();
  const isAdmin = userRole === 'admin';
  const isMessOwner = userRole === 'mess-owner';
  const isUser = userRole === 'user';
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<CommonNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'broadcast'>('notifications');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'pending' | 'approved' | 'rejected'>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Insufficient credits error state
  const [insufficientCreditsError, setInsufficientCreditsError] = useState<{
    isOpen: boolean;
    requiredCredits: number;
    availableCredits: number;
    message: string;
  }>({
    isOpen: false,
    requiredCredits: 0,
    availableCredits: 0,
    message: ''
  });
  
  // Broadcast notification state (admin only)
  const [audience, setAudience] = useState<'all' | 'role' | 'mess_members'>('all');
  const [roles, setRoles] = useState<Array<'user' | 'mess-owner' | 'admin'>>(['user', 'mess-owner', 'admin']);
  const [messId, setMessId] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const inFlightRef = useRef<AbortController | null>(null);
  const lastSignatureRef = useRef<string>('');

  const handleLogout = () => {
    alert('Logged out!');
  };

  useEffect(() => {
    loadNotifications().then(async () => {
      try {
        await messService.markAllNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })) as CommonNotification[]);
      } catch {}
    });
    // Disabled auto-refresh to prevent constant reloading
    // const interval = setInterval(() => loadNotifications(true).then(async (changed) => {
    //   if (changed) {
    //     try {
    //       await messService.markAllNotificationsAsRead();
    //       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })) as CommonNotification[]);
    //     } catch {}
    //   }
    // }), 15000);
    return () => {
      // clearInterval(interval); // Disabled auto-refresh
      if (inFlightRef.current) inFlightRef.current.abort();
    };
  }, []);

  const computeSignature = (items: CommonNotification[]): string => {
    const normalized = items
      .map((n: any) => ({ id: n._id || n.id, isRead: n.isRead, status: n.status, t: n.updatedAt || n.createdAt }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return JSON.stringify(normalized);
  };

  const dedupe = (arr: any[]) => arr.filter((n: any, index: number, self: any[]) => index === self.findIndex((x: any) => (x._id || x.id) === (n._id || n.id)));

  const loadNotifications = async (background: boolean = false): Promise<boolean> => {
    try {
      if (!background) setLoading(true);
      if (inFlightRef.current) inFlightRef.current.abort();
      const controller = new AbortController();
      inFlightRef.current = controller;

      console.log('🔔 Loading notifications for mess owner...');
      const response = await messService.getNotifications();
      console.log('📋 Notification API response:', response);
      
      if (response.success && response.data) {
        const unique = dedupe(response.data);
        console.log(`📊 Found ${unique.length} unique notifications`);
        const nextSignature = computeSignature(unique);
        if (nextSignature !== lastSignatureRef.current) {
          console.log('🔄 Notification data changed, updating state');
          setNotifications(unique);
          lastSignatureRef.current = nextSignature;
          return true;
        } else {
          console.log('📝 No changes in notification data');
        }
      } else {
        console.warn('⚠️ No notification data received:', response);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      // Don't clear notifications on error, keep existing ones
    } finally {
      if (!background) setLoading(false);
    }
    return false;
  };

  const handleAction = async (notificationId: string, action: NotificationAction, remarks?: string): Promise<void> => {
    try {
      if (action === 'mark_read') {
        await messService.markNotificationAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((notif) => {
            if ((notif as any)._id === notificationId || notif.id === notificationId) {
              return { ...notif, isRead: true } as CommonNotification;
            }
            return notif;
          })
        );
      } else if (action === 'delete') {
        setNotifications((prev) => prev.filter((notif) => (notif as any)._id !== notificationId && notif.id !== notificationId));
        await messService.deleteNotification(notificationId);
      } else if (action === 'approve' || action === 'reject') {
        // For join_request and payment_request, use dedicated endpoints
        const notification = notifications.find((notif) => (notif as any)._id === notificationId || notif.id === notificationId);
        if (!notification) {
          throw new Error('Notification not found');
        }

        if (notification.type === 'join_request') {
          // Use join request endpoint
          const response = await messService.handleJoinRequestAction(notificationId, action, remarks);
          
          if (action === 'approve' && response.data?.creditData) {
            const creditData = response.data.creditData;
            if (!creditData.sufficient) {
              throw {
                message: creditData.message || 'Insufficient credits',
                creditData: {
                  requiredCredits: creditData.requiredCredits,
                  availableCredits: creditData.availableCredits
                }
              };
            }
          }
        } else {
          // Use general notification action endpoint
          const response = await messService.handleNotificationAction(notificationId, action, remarks);
          
          if (action === 'approve' && response.data) {
            const creditData = response.data.creditDeduction || response.data;
            if (creditData && creditData.requiredCredits !== undefined && !creditData.sufficient) {
              throw {
                message: creditData.message || 'Insufficient credits',
                creditData: {
                  requiredCredits: creditData.requiredCredits,
                  availableCredits: creditData.availableCredits
                }
              };
            }
          }
        }
        
        // Update notification status
        setNotifications((prev) =>
          prev.map((notif) => {
            if ((notif as any)._id === notificationId || notif.id === notificationId) {
              if (action === 'approve') return { ...notif, status: 'approved', isRead: true } as CommonNotification;
              if (action === 'reject') return { ...notif, status: 'rejected', isRead: true } as CommonNotification;
            }
            return notif;
          })
        );
        
        toast({
          title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
          description: action === 'approve' ? 'The request has been approved successfully' : 'The request has been rejected',
          variant: action === 'approve' ? 'success' : 'default',
        });
      }
    } catch (error: any) {
      console.error('Error handling notification action:', error);
      
      // Check if this is an insufficient credits error
      if (error.creditData && error.creditData.requiredCredits !== undefined) {
        setInsufficientCreditsError({
          isOpen: true,
          requiredCredits: error.creditData.requiredCredits,
          availableCredits: error.creditData.availableCredits,
          message: error.message || 'Insufficient credits to approve this request'
        });
        throw error; // Re-throw to let NotificationsSectionNew handle it
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to process request',
          variant: 'destructive',
        });
        throw error;
      }
    }
  };

  // Broadcast notification handler (admin only)
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSubmitting(true);
    setBroadcastSuccess(null);
    setBroadcastError(null);
    try {
      const payload: any = { audience, title: broadcastTitle, message: broadcastMessage, priority };
      if (audience === 'role') payload.roles = roles;
      if (audience === 'mess_members' && messId) payload.messId = messId;
      const res = await adminService.createBroadcastNotification(payload);
      if (res.success) {
        setBroadcastSuccess('Broadcast sent successfully');
        setBroadcastTitle('');
        setBroadcastMessage('');
        setMessId('');
        // Optionally reload notifications after broadcast
        setTimeout(() => loadNotifications(true), 1000);
      } else {
        setBroadcastError(res.message || 'Failed to send broadcast');
      }
    } catch (err: any) {
      setBroadcastError(err.message || 'Failed to send broadcast');
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingCount = notifications.filter((n) => n.status === 'pending').length;

  // Calculate status counts for filter
  const statusCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      unread: 0,
      read: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    notifications.forEach(notification => {
      // Count by read status
      if (!notification.isRead) counts.unread++;
      else counts.read++;
      
      // Count by notification status
      const status = (notification.status || '').toLowerCase();
      if (status === 'pending') counts.pending++;
      else if (status === 'approved') counts.approved++;
      else if (status === 'rejected') counts.rejected++;
    });
    
    return counts;
  }, [notifications]);

  // Filter notifications based on selected status
  const filteredNotifications = useMemo(() => {
    if (filterStatus === 'all') return notifications;
    
    return notifications.filter(notification => {
      // Handle read/unread filters
      if (filterStatus === 'unread') return !notification.isRead;
      if (filterStatus === 'read') return notification.isRead;
      
      // Handle status-based filters
      const notificationStatus = (notification.status || '').toLowerCase().trim();
      const filterStatusLower = filterStatus.toLowerCase().trim();
      return notificationStatus === filterStatusLower;
    });
  }, [notifications, filterStatus]);

  // Filter options for FilterModal
  const filterOptions: FilterOption[] = useMemo(() => [
    {
      id: 'all',
      title: 'All',
      description: 'Show all notifications',
      icon: InformationCircleIcon,
      selected: filterStatus === 'all',
      count: statusCounts.all
    },
    {
      id: 'unread',
      title: 'Unread',
      description: 'Notifications you haven\'t read',
      icon: BellIcon,
      selected: filterStatus === 'unread',
      count: statusCounts.unread
    },
    {
      id: 'read',
      title: 'Read',
      description: 'Notifications you\'ve already read',
      icon: EnvelopeIcon,
      selected: filterStatus === 'read',
      count: statusCounts.read
    },
    {
      id: 'pending',
      title: 'Pending',
      description: 'Notifications awaiting action',
      icon: ClockIcon,
      selected: filterStatus === 'pending',
      count: statusCounts.pending
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Approved notifications',
      icon: CheckCircleIcon,
      selected: filterStatus === 'approved',
      count: statusCounts.approved
    },
    {
      id: 'rejected',
      title: 'Rejected',
      description: 'Rejected notifications',
      icon: XMarkIcon,
      selected: filterStatus === 'rejected',
      count: statusCounts.rejected
    }
  ], [filterStatus, statusCounts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-all duration-300">
        <SideNavigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} handleLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-screen lg:ml-30">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
        <BottomNavigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} handleLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} handleLogout={handleLogout} />
      
      <div className="lg:ml-90 transition-all duration-300 relative pb-24 lg:pb-0">
        {/* Header */}
        <CommonHeader
          title={isAdmin ? 'Notifications' : isUser ? 'My Notifications' : 'Mess Notifications'}
          subtitle={`${unreadCount} unread ${isMessOwner || isAdmin ? `• ${pendingCount} pending requests` : ''}`}
          variant="default"
        >
          {(!isAdmin || activeTab === 'notifications') && (
            <Button
              variant="outline"
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2"
              size="sm"
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          )}
        </CommonHeader>

        {/* Admin Tabs */}
        {isAdmin && (
          <div className="mb-6 border-b border-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Notifications
              </button>
              <button
                onClick={() => setActiveTab('broadcast')}
                className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'broadcast'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MegaphoneIcon className="w-5 h-5" />
                Broadcast
              </button>
            </div>
          </div>
        )}

        {/* Broadcast Form (Admin Only) */}
        {isAdmin && activeTab === 'broadcast' && (
          <div className="bg-card rounded-lg border border-border p-6 max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-4">Broadcast Notifications</h2>
            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Audience</label>
                <select 
                  value={audience} 
                  onChange={e => setAudience(e.target.value as any)} 
                  className="w-full border border-border rounded-md p-2 bg-background text-foreground"
                >
                  <option value="all">All Users</option>
                  <option value="role">By Role</option>
                  <option value="mess_members">Mess Members</option>
                </select>
              </div>
              {audience === 'role' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Roles</label>
                  <div className="flex gap-3 flex-wrap">
                    {(['user','mess-owner','admin'] as const).map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={roles.includes(r)} 
                          onChange={() => {
                            setRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground capitalize">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {audience === 'mess_members' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Mess ID</label>
                  <input 
                    value={messId} 
                    onChange={e => setMessId(e.target.value)} 
                    className="w-full border border-border rounded-md p-2 bg-background text-foreground" 
                    placeholder="Enter Mess ID" 
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
                <input 
                  value={broadcastTitle} 
                  onChange={e => setBroadcastTitle(e.target.value)} 
                  className="w-full border border-border rounded-md p-2 bg-background text-foreground" 
                  placeholder="Notification Title" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Message</label>
                <textarea 
                  value={broadcastMessage} 
                  onChange={e => setBroadcastMessage(e.target.value)} 
                  className="w-full border border-border rounded-md p-2 bg-background text-foreground" 
                  placeholder="Notification Message" 
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Priority</label>
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value as any)} 
                  className="w-full border border-border rounded-md p-2 bg-background text-foreground"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              {broadcastSuccess && (
                <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 rounded-md">
                  <p className="text-sm text-green-700 dark:text-green-400">{broadcastSuccess}</p>
                </div>
              )}
              {broadcastError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-400">{broadcastError}</p>
                </div>
              )}
              <button 
                type="submit" 
                disabled={broadcastSubmitting} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                {broadcastSubmitting ? 'Sending...' : 'Send Broadcast'}
              </button>
            </form>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-3 pb-20 relative overflow-y-auto scrollbar-hide" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div className="p-3">
            {/* Admin Tabs */}
            {isAdmin && (
              <div className="mb-6 border-b border-border">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'notifications'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    My Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab('broadcast')}
                    className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                      activeTab === 'broadcast'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MegaphoneIcon className="w-5 h-5" />
                    Broadcast
                  </button>
                </div>
              </div>
            )}

            {/* Broadcast Form (Admin Only) */}
            {isAdmin && activeTab === 'broadcast' && (
              <div className="bg-card rounded-lg border border-border p-6 max-w-2xl">
                <h2 className="text-xl font-semibold text-foreground mb-4">Broadcast Notifications</h2>
                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Audience</label>
                    <select 
                      value={audience} 
                      onChange={e => setAudience(e.target.value as any)} 
                      className="w-full border border-border rounded-md p-2 bg-background text-foreground"
                    >
                      <option value="all">All Users</option>
                      <option value="role">By Role</option>
                      <option value="mess_members">Mess Members</option>
                    </select>
                  </div>
                  {audience === 'role' && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Roles</label>
                      <div className="flex gap-3 flex-wrap">
                        {(['user','mess-owner','admin'] as const).map(r => (
                          <label key={r} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={roles.includes(r)} 
                              onChange={() => {
                                setRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
                              }}
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground capitalize">{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {audience === 'mess_members' && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Mess ID</label>
                      <input 
                        value={messId} 
                        onChange={e => setMessId(e.target.value)} 
                        className="w-full border border-border rounded-md p-2 bg-background text-foreground" 
                        placeholder="Enter Mess ID" 
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
                    <input 
                      value={broadcastTitle} 
                      onChange={e => setBroadcastTitle(e.target.value)} 
                      className="w-full border border-border rounded-md p-2 bg-background text-foreground" 
                      placeholder="Notification Title" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Message</label>
                    <textarea 
                      value={broadcastMessage} 
                      onChange={e => setBroadcastMessage(e.target.value)} 
                      className="w-full border border-border rounded-md p-2 bg-background text-foreground" 
                      placeholder="Notification Message" 
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Priority</label>
                    <select 
                      value={priority} 
                      onChange={e => setPriority(e.target.value as any)} 
                      className="w-full border border-border rounded-md p-2 bg-background text-foreground"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  {broadcastSuccess && (
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-700 dark:text-green-400">{broadcastSuccess}</p>
                    </div>
                  )}
                  {broadcastError && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-700 dark:text-red-400">{broadcastError}</p>
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={broadcastSubmitting} 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    {broadcastSubmitting ? 'Sending...' : 'Send Broadcast'}
                  </button>
                </form>
              </div>
            )}

            {/* Notifications List */}
            {(!isAdmin || activeTab === 'notifications') && (
              <>


                <NotificationsSectionNew
                  notifications={filteredNotifications}
                  loading={loading}
                  onAction={handleAction}
                  onRefresh={() => loadNotifications(true)}
                  filterStatus={filterStatus}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} handleLogout={handleLogout} />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedFilter={filterStatus}
        onFilterChange={(filterId) => {
          setFilterStatus(filterId as 'all' | 'unread' | 'read' | 'pending' | 'approved' | 'rejected');
          setIsFilterModalOpen(false);
        }}
        filterOptions={filterOptions}
        title="Filter Notifications"
        showCounts={true}
      />

      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={insufficientCreditsError.isOpen}
        onClose={() => setInsufficientCreditsError(prev => ({ ...prev, isOpen: false }))}
        requiredCredits={insufficientCreditsError.requiredCredits}
        availableCredits={insufficientCreditsError.availableCredits}
        message={insufficientCreditsError.message}
      />
    </div>
  );
};

export default Notification;