import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Bell, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  CreditCard,
  Calendar,
  Send,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationPermission from '../common/NotificationPermission';
import NotificationBadge from '../common/NotificationBadge';

const NotificationTestScreen: React.FC = () => {
  const {
    isSupported,
    isPushSupported,
    permissionStatus,
    requestPermission,
    notifications,
    unreadCount,
    isLoading,
    sendNotification,
    sendLocalNotification,
    sendSystemNotification,
    sendMealPlanNotification,
    sendPaymentReminder,
    sendJoinRequestNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications
  } = useNotifications();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [`[${new Date().toLocaleTimeString()}] ${result}`, ...prev.slice(0, 9)]);
  };

  const testLocalNotification = async () => {
    try {
      await sendLocalNotification({
        type: 'general',
        title: 'Test Local Notification',
        message: 'This is a test local notification from SmartMess',
        data: { test: true, timestamp: Date.now() }
      });
      addTestResult('✅ Local notification sent successfully');
    } catch (error) {
      addTestResult(`❌ Failed to send local notification: ${error}`);
    }
  };

  const testSystemNotification = async () => {
    try {
      await sendSystemNotification(
        'System Update',
        'SmartMess has been updated with new features!',
        { update: true, version: '1.0.2' }
      );
      addTestResult('✅ System notification sent successfully');
    } catch (error) {
      addTestResult(`❌ Failed to send system notification: ${error}`);
    }
  };

  const testMealPlanNotification = async () => {
    try {
      await sendMealPlanNotification('Test Mess', 'Lunch', '2024-01-15');
      addTestResult('✅ Meal plan notification sent successfully');
    } catch (error) {
      addTestResult(`❌ Failed to send meal plan notification: ${error}`);
    }
  };

  const testPaymentReminder = async () => {
    try {
      await sendPaymentReminder('John Doe', 150, '2024-01-20');
      addTestResult('✅ Payment reminder sent successfully');
    } catch (error) {
      addTestResult(`❌ Failed to send payment reminder: ${error}`);
    }
  };

  const testJoinRequestNotification = async () => {
    try {
      await sendJoinRequestNotification('Jane Smith', 'Test Mess');
      addTestResult('✅ Join request notification sent successfully');
    } catch (error) {
      addTestResult(`❌ Failed to send join request notification: ${error}`);
    }
  };

  const testFullNotification = async () => {
    try {
      await sendNotification({
        type: 'payment_request',
        title: 'Payment Request',
        message: 'You have a pending payment of $75 for this month',
        userId: localStorage.getItem('userId') || '',
        data: { amount: 75, dueDate: '2024-01-25' }
      });
      addTestResult('✅ Full notification (backend + local) sent successfully');
    } catch (error) {
      addTestResult(`❌ Failed to send full notification: ${error}`);
    }
  };

  const testPermissionRequest = async () => {
    try {
      const granted = await requestPermission();
      addTestResult(granted ? '✅ Permission granted' : '❌ Permission denied');
    } catch (error) {
      addTestResult(`❌ Permission request failed: ${error}`);
    }
  };

  const testRefreshNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await getNotifications(userId, 10);
        addTestResult('✅ Notifications refreshed successfully');
      } else {
        addTestResult('❌ No user ID found');
      }
    } catch (error) {
      addTestResult(`❌ Failed to refresh notifications: ${error}`);
    }
  };

  const testMarkAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await markAllAsRead(userId);
        addTestResult('✅ All notifications marked as read');
      } else {
        addTestResult('❌ No user ID found');
      }
    } catch (error) {
      addTestResult(`❌ Failed to mark all as read: ${error}`);
    }
  };

  const testClearNotifications = () => {
    clearNotifications();
    addTestResult('✅ Local notifications cleared');
  };

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
            PWA Notification Test
          </h1>
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
            Test and verify PWA notification functionality
          </p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Support:</span>
                <Badge variant={isSupported ? "default" : "secondary"}>
                  {isSupported ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Push:</span>
                <Badge variant={isPushSupported ? "default" : "secondary"}>
                  {isPushSupported ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Permission:</span>
                <Badge 
                  variant={
                    permissionStatus === 'granted' ? "default" : 
                    permissionStatus === 'denied' ? "destructive" : "secondary"
                  }
                >
                  {permissionStatus}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Unread:</span>
                <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
                  {unreadCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permission Management */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>
              Request and manage notification permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationPermission />
            <div className="flex items-center space-x-4">
              <Button onClick={testPermissionRequest} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Request Permission
              </Button>
              <NotificationBadge variant="default" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Tests</CardTitle>
            <CardDescription>
              Test different types of notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button onClick={testLocalNotification} className="h-auto p-4 flex flex-col items-center space-y-2">
                <Bell className="w-5 h-5" />
                <span>Local Notification</span>
              </Button>
              
              <Button onClick={testSystemNotification} className="h-auto p-4 flex flex-col items-center space-y-2">
                <AlertCircle className="w-5 h-5" />
                <span>System Notification</span>
              </Button>
              
              <Button onClick={testMealPlanNotification} className="h-auto p-4 flex flex-col items-center space-y-2">
                <Calendar className="w-5 h-5" />
                <span>Meal Plan Update</span>
              </Button>
              
              <Button onClick={testPaymentReminder} className="h-auto p-4 flex flex-col items-center space-y-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Reminder</span>
              </Button>
              
              <Button onClick={testJoinRequestNotification} className="h-auto p-4 flex flex-col items-center space-y-2">
                <Users className="w-5 h-5" />
                <span>Join Request</span>
              </Button>
              
              <Button onClick={testFullNotification} className="h-auto p-4 flex flex-col items-center space-y-2">
                <Send className="w-5 h-5" />
                <span>Full Notification</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Management */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Management</CardTitle>
            <CardDescription>
              Manage and control notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Button onClick={testRefreshNotifications} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={testMarkAllAsRead} variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button onClick={testClearNotifications} variant="outline">
                <XCircle className="w-4 h-4 mr-2" />
                Clear Local
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Recent Notifications ({notifications.length})</h4>
              {notifications.length === 0 ? (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">
                  No notifications found
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        notification.isRead 
                          ? 'bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border'
                          : 'bg-SmartMess-light-primary dark:SmartMess-dark-primary/5 dark:bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 border-SmartMess-light-primary dark:SmartMess-dark-primary/20 dark:border-SmartMess-light-primary dark:SmartMess-dark-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {notification.title}
                          </h5>
                          <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <Badge className="bg-SmartMess-light-error dark:bg-SmartMess-dark-error text-white text-xs">
                                Unread
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => notification.id && markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          {notification.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id!)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Recent test execution results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-SmartMess-light-accent dark:SmartMess-dark-accent dark:bg-SmartMess-light-accent dark:SmartMess-dark-accent rounded-lg p-3 max-h-40 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">
                  No test results yet. Run some tests to see results here.
                </p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationTestScreen; 