import type { DashboardProps } from './Dashboard.types';
import { useDashboard } from './Dashboard.hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard: React.FC<DashboardProps> = () => {
  const {
    stats,
    loading,
    // error - not currently used
  } = useDashboard();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mess Owner Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? 'Loading...' : stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        
        {/* Add more cards for other stats */}
      </div>
    </div>
  );
};

export default Dashboard;