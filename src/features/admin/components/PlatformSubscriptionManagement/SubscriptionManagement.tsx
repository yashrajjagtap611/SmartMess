import React, { useState } from 'react';
import { Users, CreditCard, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Badge } from '../../../../components/ui/badge';
import { PageHeader } from '@/components/common/Header/CommonHeader';
import CreditSlabsManagement from './CreditSlabsManagement';
import CreditPurchasePlansManagement from './CreditPurchasePlansManagement';
import FreeTrialSettingsManagement from './FreeTrialSettingsManagement';
// Monthly billing dashboard removed
import AdminControlsDashboard from './AdminControlsDashboard';

const SubscriptionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        pageTitle="Credit Management System"
        pageDescription="Comprehensive credit-based subscription management for SmartMess platform"
      >
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Active System
        </Badge>
      </PageHeader>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card border border-border p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="slabs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Credit Slabs
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Purchase Plans
            </TabsTrigger>
            <TabsTrigger value="trial" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Free Trial
            </TabsTrigger>
            {/* Billing tab removed */}
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Controls
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('slabs')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    User-Based Credit Slabs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Configure credit deduction rates based on the number of users in each mess
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Example:</span>
                      <span className="font-medium">1-50 users → 6 credits/user</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span></span>
                      <span className="font-medium">51-100 users → 5 credits/user</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span></span>
                      <span className="font-medium">101-200 users → 4.5 credits/user</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('plans')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Credit Purchase Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create and manage credit packages that mess owners can purchase
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Credits:</span>
                      <span className="font-medium">100 credits</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bonus Credits:</span>
                      <span className="font-medium text-green-600">+10 bonus</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span className="font-medium">₹100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('trial')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Free Trial Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Configure free trial options for new mess registrations
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Trial Duration:</span>
                      <span className="font-medium">7 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Trial Credits:</span>
                      <span className="font-medium">100 credits</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Auto-activate:</span>
                      <span className="font-medium text-green-600">Enabled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Billing card removed */}
            </div>

            {/* System Features Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">User-based credit slabs with automatic calculation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Flexible credit purchase plans with bonus options</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Configurable free trial settings</span>
                    </div>
                    {/* Automated monthly billing removed */}
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Manual credit adjustments and reporting</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Comprehensive transaction tracking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">1</span>
                      <span className="text-sm text-foreground">Admin defines credit slabs based on user ranges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">2</span>
                      <span className="text-sm text-foreground">Mess owners purchase credit packages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">3</span>
                      <span className="text-sm text-foreground">System automatically calculates monthly charges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">4</span>
                      <span className="text-sm text-foreground">Credits are deducted based on user count</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">5</span>
                      <span className="text-sm text-foreground">Low balance notifications and account suspension</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Credit Slabs Tab */}
          <TabsContent value="slabs">
            <CreditSlabsManagement />
          </TabsContent>

          {/* Purchase Plans Tab */}
          <TabsContent value="plans">
            <CreditPurchasePlansManagement />
          </TabsContent>

          {/* Free Trial Tab */}
          <TabsContent value="trial">
            <FreeTrialSettingsManagement />
          </TabsContent>

          {/* Monthly Billing tab removed */}

          {/* Admin Controls Tab */}
          <TabsContent value="controls">
            <AdminControlsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionManagement;



