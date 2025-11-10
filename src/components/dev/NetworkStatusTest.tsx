import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NetworkStatus from '@/components/common/NetworkStatus';

export default function NetworkStatusTest() {
  const simulateNetworkChange = () => {
    // Simulate network status change by dispatching events
    const event = new Event('offline');
    window.dispatchEvent(event);
    
    // Simulate coming back online after 2 seconds
    setTimeout(() => {
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Network Status Auto-Hide Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
            This component demonstrates the NetworkStatus auto-hide functionality. 
            The indicators will show for 5 seconds when network status changes and then automatically hide.
          </p>
          
          <Button onClick={simulateNetworkChange} variant="outline">
            Simulate Network Change
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Default (Auto-hide: 5s)</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkStatus />
            <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-2">
              Shows for 5 seconds when network status changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Delay (3s)</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkStatus autoHide={true} hideDelay={3000} />
            <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-2">
              Shows for 3 seconds when network status changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Always Visible</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkStatus autoHide={false} />
            <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-2">
              Always visible (auto-hide disabled)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed View</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkStatus showDetails={true} autoHide={false} />
            <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-2">
              Shows detailed connection information
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p><strong>Method 1:</strong> Click "Simulate Network Change" button above</p>
            <p><strong>Method 2:</strong> Use browser DevTools:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Open DevTools (F12)</li>
              <li>Go to Network tab</li>
              <li>Check "Offline" checkbox</li>
              <li>Uncheck to simulate coming back online</li>
            </ul>
            <p><strong>Method 3:</strong> Disconnect your internet connection</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 