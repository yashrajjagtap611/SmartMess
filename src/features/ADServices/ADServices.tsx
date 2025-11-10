import React, { useState, useEffect } from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useNavigate } from 'react-router-dom';
import { handleLogout as logoutUtil } from '@/utils/logout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adService } from '@/services/api/adService';
import type { AdCredit, AdCampaign } from '@/types/ads';
import { useUser } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Plus, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick,
  MessageSquare,
  Loader2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatDisplayDate } from '@/utils/dateUtils';
import CreateCampaignDialog from './Components/CreateCampaignDialog';

const AdServices: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<AdCredit | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'credits'>('overview');
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  // Check if user is mess owner or admin (both can access ad services)
  const isMessOwner = user?.role === 'mess-owner';
  const isAdmin = user?.role === 'admin';
  const canAccess = isMessOwner || isAdmin;

  useEffect(() => {
    if (canAccess) {
      loadData();
    }
  }, [canAccess]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Only fetch credits for mess owners (admins don't need credits)
      if (isMessOwner) {
        try {
          const creditsResponse = await adService.getCredits();
          if (creditsResponse.success) {
            setCredits(creditsResponse.data);
          }
        } catch (error: any) {
          // Credits might fail for admin, that's okay
          console.warn('Failed to fetch credits:', error);
        }
      }
      
      // Fetch campaigns for both admin and mess owner
      const campaignsResponse = await adService.getCampaigns();
      if (campaignsResponse.success) {
        setCampaigns(campaignsResponse.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load ad services data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid credit amount',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await adService.purchaseCredits(parseFloat(purchaseAmount));
      if (response.success) {
        setCredits(response.data);
        setShowPurchaseDialog(false);
        setPurchaseAmount('');
        toast({
          title: 'Success',
          description: `Successfully purchased ${purchaseAmount} credits`,
          variant: 'default'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to purchase credits',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      draft: 'secondary',
      pending_approval: 'outline',
      paused: 'secondary',
      completed: 'default',
      rejected: 'destructive'
    };
    
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      draft: 'bg-gray-500',
      pending_approval: 'bg-yellow-500',
      paused: 'bg-blue-500',
      completed: 'bg-purple-500',
      rejected: 'bg-red-500'
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className={colors[status] || ''}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only mess owners and admins can access Ad Services</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const clickThroughRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="lg:ml-90 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 border-b SmartMess-light-border dark:SmartMess-dark-border">
          <div className="flex items-center justify-center w-full lg:hidden">
            <h1 className="text-xl md:text-2xl font-bold text-center text-SmartMess-light-text dark:SmartMess-dark-text">
              Ad Services
            </h1>
          </div>
          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="flex items-center space-x-6 px-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text">
                  Ad Services
                </h1>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Manage your advertising campaigns and credits
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pr-6">
              <Button onClick={() => setShowCreateCampaign(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <TabsList className={`grid w-full ${isMessOwner ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              {isMessOwner && <TabsTrigger value="credits">Credits</TabsTrigger>}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Credit Balance Card - Only for mess owners */}
              {isMessOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Credit Balance</span>
                      <Button onClick={() => setShowPurchaseDialog(true)} size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase Credits
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Credits</p>
                        <p className="text-3xl font-bold">{credits?.availableCredits || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Credits</p>
                        <p className="text-3xl font-bold">{credits?.totalCredits || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Used Credits</p>
                        <p className="text-3xl font-bold">{credits?.usedCredits || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Campaigns</p>
                        <p className="text-2xl font-bold">{activeCampaigns}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Impressions</p>
                        <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
                      </div>
                      <Eye className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Clicks</p>
                        <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                      </div>
                      <MousePointerClick className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Click-Through Rate</p>
                        <p className="text-2xl font-bold">{clickThroughRate}%</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Campaigns */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.slice(0, 5).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No campaigns yet</p>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.slice(0, 5).map((campaign) => (
                        <div key={campaign._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{campaign.title}</h3>
                              {getStatusBadge(campaign.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {campaign.campaignType} • {campaign.impressions} impressions • {campaign.clicks} clicks
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            // Navigate to campaign details - to be implemented
                            toast({
                              title: 'Coming Soon',
                              description: 'Campaign details page will be available soon',
                              variant: 'default'
                            });
                          }}>
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">All Campaigns</h2>
                <Button onClick={() => setShowCreateCampaign(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>

              {campaigns.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                      <p className="text-muted-foreground mb-4">Create your first ad campaign to reach your target audience</p>
                      <Button onClick={() => setShowCreateCampaign(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {campaign.title}
                              {getStatusBadge(campaign.status)}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {campaign.description || 'No description'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="font-semibold">{campaign.campaignType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Impressions</p>
                            <p className="font-semibold">{campaign.impressions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Clicks</p>
                            <p className="font-semibold">{campaign.clicks}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Credits Used</p>
                            <p className="font-semibold">{campaign.creditsUsed}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDisplayDate(new Date(campaign.startDate))} - {formatDisplayDate(new Date(campaign.endDate))}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {campaign.actualReach} users reached
                            </span>
                          </div>
                          <Button variant="outline" size="sm" onClick={async () => {
                            try {
                              const response = await adService.getCampaignAnalytics(campaign._id);
                              if (response.success) {
                                toast({
                                  title: 'Campaign Analytics',
                                  description: `Impressions: ${response.data.analytics.impressions}, Clicks: ${response.data.analytics.clicks}`,
                                  variant: 'default'
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error.message || 'Failed to load analytics',
                                variant: 'destructive'
                              });
                            }
                          }}>
                            View Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Credits Tab - Only for mess owners */}
            {isMessOwner && (
              <TabsContent value="credits" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Management</CardTitle>
                    <CardDescription>Purchase and manage your ad credits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-2">Available Credits</p>
                          <p className="text-4xl font-bold">{credits?.availableCredits || 0}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-2">Total Purchased</p>
                          <p className="text-4xl font-bold">{credits?.totalCredits || 0}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-2">Credits Used</p>
                          <p className="text-4xl font-bold">{credits?.usedCredits || 0}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={() => setShowPurchaseDialog(true)} size="lg">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Purchase Credits
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />

      {/* Purchase Credits Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Ad Credits</DialogTitle>
            <DialogDescription>
              Enter the amount of credits you want to purchase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="creditAmount">Credit Amount</Label>
              <Input
                id="creditAmount"
                type="number"
                min="1"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder="Enter credit amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPurchaseDialog(false); setPurchaseAmount(''); }}>
              Cancel
            </Button>
            <Button onClick={handlePurchaseCredits}>
              Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        open={showCreateCampaign}
        onOpenChange={setShowCreateCampaign}
        onSuccess={() => {
          loadData();
          setShowCreateCampaign(false);
        }}
      />
    </div>
  );
};

export default AdServices;

