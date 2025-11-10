import React, { useState, useEffect } from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useNavigate } from 'react-router-dom';
import { handleLogout as logoutUtil } from '@/utils/logout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { adService } from '@/services/api/adService';
import type { AdSettings } from '@/types/ads';
import { useUser } from '@/contexts/AuthContext';
import { Loader2, Save, RefreshCw, CreditCard, Image, MessageSquare, Shield, AlertCircle } from 'lucide-react';

const AdSettings: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'pricing' | 'display' | 'messaging' | 'policies'>('pricing');
  
  // Check if user is admin (only admin can edit settings)
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adService.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch ad settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only administrators can modify ad settings',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/ads/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Ad settings saved successfully',
          variant: 'default'
        });
        setSettings(data.data);
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save ad settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
            Failed to load settings
          </p>
          <Button onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
              Ad Services Settings
            </h1>
          </div>
          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="flex items-center space-x-6 px-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text">
                  Ad Services Settings
                </h1>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Configure ad pricing, policies, and display settings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pr-6">
              {isAdmin && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              )}
              {!isAdmin && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>View Only</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Credit Pricing</span>
                <span className="sm:hidden">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Ad Card Display</span>
                <span className="sm:hidden">Display</span>
              </TabsTrigger>
              <TabsTrigger value="messaging" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Messaging</span>
                <span className="sm:hidden">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Policies</span>
                <span className="sm:hidden">Rules</span>
              </TabsTrigger>
            </TabsList>

            {/* Credit Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Pricing</CardTitle>
                  <CardDescription>
                    Set the credit cost per user for different ad types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="creditPricePerUserAdCard">
                      Credits per User (Ad Card Display)
                    </Label>
                    <Input
                      id="creditPricePerUserAdCard"
                      type="number"
                      min="0"
                      step="0.1"
                      value={settings.creditPricePerUserAdCard}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          creditPricePerUserAdCard: parseFloat(e.target.value) || 0
                        })
                      }
                      disabled={!isAdmin}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cost in credits for displaying an ad card to one user
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creditPricePerUserMessaging">
                      Credits per User (Mass Messaging)
                    </Label>
                    <Input
                      id="creditPricePerUserMessaging"
                      type="number"
                      min="0"
                      step="0.1"
                      value={settings.creditPricePerUserMessaging}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          creditPricePerUserMessaging: parseFloat(e.target.value) || 0
                        })
                      }
                      disabled={!isAdmin}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cost in credits for sending mass messages to one user
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ad Card Display Settings Tab */}
            <TabsContent value="display" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ad Card Display Settings</CardTitle>
                  <CardDescription>
                    Configure how ad cards are displayed to users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="adCardDelaySeconds">
                      Delay Before Display (seconds)
                    </Label>
                    <Input
                      id="adCardDelaySeconds"
                      type="number"
                      min="0"
                      max="60"
                      value={settings.adCardDelaySeconds}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adCardDelaySeconds: parseInt(e.target.value) || 0
                        })
                      }
                      disabled={!isAdmin}
                    />
                    <p className="text-xs text-muted-foreground">
                      Delay in seconds before showing ad card on app open (0-60)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultAdCardDisplayDuration">
                      Default Display Duration (seconds)
                    </Label>
                    <Input
                      id="defaultAdCardDisplayDuration"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.defaultAdCardDisplayDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultAdCardDisplayDuration: parseInt(e.target.value) || 5
                        })
                      }
                      disabled={!isAdmin}
                    />
                    <p className="text-xs text-muted-foreground">
                      How long the ad card is displayed (1-30 seconds)
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-0.5">
                      <Label htmlFor="googleAdsEnabled">Enable Google Ads</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow Google Ads to be displayed in ad cards
                      </p>
                    </div>
                    <Switch
                      id="googleAdsEnabled"
                      checked={settings.googleAdsEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          googleAdsEnabled: checked
                        })
                      }
                      disabled={!isAdmin}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messaging Window Settings Tab */}
            <TabsContent value="messaging" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messaging Window Settings</CardTitle>
                  <CardDescription>
                    Configure the messaging window for advertising campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultMessagingWindowHours">
                      Default Messaging Window (hours)
                    </Label>
                    <Input
                      id="defaultMessagingWindowHours"
                      type="number"
                      min="1"
                      max="168"
                      value={settings.defaultMessagingWindowHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultMessagingWindowHours: parseInt(e.target.value) || 24
                        })
                      }
                      disabled={!isAdmin}
                    />
                    <p className="text-xs text-muted-foreground">
                      Duration of messaging window for advertising campaigns (1-168 hours / 7 days)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ad Policies Tab */}
            <TabsContent value="policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ad Policies</CardTitle>
                  <CardDescription>
                    Set policies and restrictions for ad campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxAdDurationDays">
                        Max Ad Duration (days)
                      </Label>
                      <Input
                        id="maxAdDurationDays"
                        type="number"
                        min="1"
                        max="365"
                        value={settings.policies.maxAdDurationDays}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            policies: {
                              ...settings.policies,
                              maxAdDurationDays: parseInt(e.target.value) || 30
                            }
                          })
                        }
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxImageSizeMB">
                        Max Image Size (MB)
                      </Label>
                      <Input
                        id="maxImageSizeMB"
                        type="number"
                        min="1"
                        max="50"
                        value={settings.policies.maxImageSizeMB}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            policies: {
                              ...settings.policies,
                              maxImageSizeMB: parseInt(e.target.value) || 5
                            }
                          })
                        }
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxVideoSizeMB">
                        Max Video Size (MB)
                      </Label>
                      <Input
                        id="maxVideoSizeMB"
                        type="number"
                        min="1"
                        max="500"
                        value={settings.policies.maxVideoSizeMB}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            policies: {
                              ...settings.policies,
                              maxVideoSizeMB: parseInt(e.target.value) || 50
                            }
                          })
                        }
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxTitleLength">
                        Max Title Length
                      </Label>
                      <Input
                        id="maxTitleLength"
                        type="number"
                        min="1"
                        value={settings.policies.maxTitleLength}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            policies: {
                              ...settings.policies,
                              maxTitleLength: parseInt(e.target.value) || 100
                            }
                          })
                        }
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDescriptionLength">
                        Max Description Length
                      </Label>
                      <Input
                        id="maxDescriptionLength"
                        type="number"
                        min="1"
                        value={settings.policies.maxDescriptionLength}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            policies: {
                              ...settings.policies,
                              maxDescriptionLength: parseInt(e.target.value) || 500
                            }
                          })
                        }
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireApproval">Require Admin Approval</Label>
                      <p className="text-xs text-muted-foreground">
                        All campaigns must be approved by admin before going live
                      </p>
                    </div>
                    <Switch
                      id="requireApproval"
                      checked={settings.policies.requireApproval}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          policies: {
                            ...settings.policies,
                            requireApproval: checked
                          }
                        })
                      }
                      disabled={!isAdmin}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button for Mobile */}
          {isAdmin && (
            <div className="lg:hidden fixed bottom-20 left-0 right-0 p-4 bg-SmartMess-light-bg dark:SmartMess-dark-bg border-t SmartMess-light-border dark:SmartMess-dark-border z-10">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default AdSettings;
