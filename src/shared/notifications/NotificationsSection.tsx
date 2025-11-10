import React from 'react';
import type { CommonNotification, NotificationAction, NotificationTabConfig } from './types';
import { formatNotificationTime, getStatusBadge, getNotificationId, sortByPriorityAndTime } from './utils';

interface NotificationsSectionProps {
  title?: string;
  tabs?: NotificationTabConfig[];
  notifications: CommonNotification[];
  onAction: (notificationId: string, action: NotificationAction) => void;
  renderIcon?: (n: CommonNotification) => React.ReactNode;
  rightActions?: (n: CommonNotification) => React.ReactNode;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  title = 'Notifications',
  tabs,
  notifications,
  onAction,
  renderIcon,
  rightActions,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>(tabs?.[0]?.key || 'all');
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = React.useMemo(() => {
    const items = sortByPriorityAndTime(notifications);
    if (!tabs || activeTab === 'all') return items;
    const current = tabs.find(t => t.key === activeTab);
    return current ? items.filter(current.filter) : items;
  }, [notifications, tabs, activeTab]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
      </div>

      {tabs && (
        <div className="flex border-b border-border mb-4 overflow-x-auto">
          {[{ key: 'all', label: 'All', filter: () => true }, ...tabs].map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No notifications</div>
        ) : (
          filtered.map(n => {
            const id = getNotificationId(n);
            const badge = getStatusBadge(n.status);
            const timeValRaw: any = (n as any).timestamp || (n as any).createdAt || (n as any).updatedAt;
            let timeVal: any = timeValRaw;
            // Fallback: derive time from MongoDB ObjectId if needed
            if ((!timeVal || isNaN(new Date(timeVal as any).getTime())) && id && /^[a-f\d]{24}$/i.test(id)) {
              const seconds = parseInt(id.substring(0, 8), 16);
              timeVal = new Date(seconds * 1000);
            }
            return (
              <div key={id || Math.random()} className={`rounded-xl border border-border p-4 bg-card transition-all ${
                !n.isRead ? 'ring-2 ring-primary/10 bg-accent/5' : ''
              }`}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    {renderIcon ? renderIcon(n) : <div className="w-5 h-5 rounded-full bg-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold truncate text-card-foreground">{n.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${badge.colorClassNames}`}>{badge.text}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatNotificationTime(timeVal)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 break-words">{n.message}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Only show default actions if no rightActions are provided */}
                        {!rightActions && (
                          <>
                            {!n.isRead && id && (
                              <button 
                                onClick={() => onAction(id, 'mark_read')} 
                                className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                              >
                                Mark read
                              </button>
                            )}
                            {n.status === 'pending' && id && (
                              <>
                                <button 
                                  onClick={() => onAction(id, 'approve')} 
                                  className="px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => onAction(id, 'reject')} 
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {rightActions && rightActions(n)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}; 