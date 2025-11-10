import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle,
  ShoppingCart,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Switch } from '../../../../components/ui/switch';
import { PageHeader } from '@/components/common/Header/CommonHeader';
import { messBillingService, MessCredits, CreditTransaction } from '@/services/messBillingService';
import { creditManagementService } from '@/services/creditManagementService';
import { paymentService } from '@/services/paymentService';
import { freeTrialService } from '@/services/freeTrialService';
import { CreditPurchasePlan } from '@/types/creditManagement';
import { useMessProfile } from '@/contexts/MessProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const MessOwnerSubscription: React.FC = () => {
  const { messProfile } = useMessProfile();
  const { user } = useAuth();
  const messId = messProfile?._id;

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<MessCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [plans, setPlans] = useState<CreditPurchasePlan[]>([]);
  const [autoRenewalLoading, setAutoRenewalLoading] = useState(false);
  const [currentUserCount, setCurrentUserCount] = useState<number>(0);
  const [nextBillingAmount, setNextBillingAmount] = useState<number>(0);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [trialAvailable, setTrialAvailable] = useState(false);
  const [processingBill, setProcessingBill] = useState(false);

  useEffect(() => {
    if (messId) {
      fetchData();
      checkTrialAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messId]);

  const checkTrialAvailability = async () => {
    try {
      const response = await freeTrialService.checkAvailability();
      if (response.success && response.data) {
        setTrialAvailable(response.data.available);
      }
    } catch (error) {
      console.error('Failed to check trial availability:', error);
    }
  };

  const fetchData = async () => {
    if (!messId) return;
    
    try {
      setLoading(true);
      const [billingData, plansData] = await Promise.all([
        messBillingService.getBillingDetails(messId),
        creditManagementService.getCreditPurchasePlans({ isActive: true })
      ]);

      if (billingData.success && billingData.data) {
        setCredits(billingData.data.credits);
        setTransactions(billingData.data.recentTransactions || []);
        setCurrentUserCount(billingData.data.currentUserCount || 0);
        setNextBillingAmount(billingData.data.nextBillingAmount || 0);
      }

      if (plansData.success && plansData.data) {
        // Filter out plans with invalid data
        const validPlans = plansData.data.filter(plan => 
          plan && 
          plan._id && 
          plan.name && 
          typeof plan.price === 'number' && 
          typeof plan.baseCredits === 'number' &&
          typeof plan.bonusCredits === 'number'
        );
        setPlans(validPlans);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load subscription data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenewal = async (checked: boolean) => {
    if (!messId || !credits) return;

    try {
      setAutoRenewalLoading(true);
      const response = await messBillingService.toggleAutoRenewal(messId, checked);
      
      if (response.success && response.data) {
        setCredits(response.data);
        toast({
          title: 'Success',
          description: `Auto-renewal ${response.data.autoRenewal ? 'enabled' : 'disabled'} successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle auto-renewal',
        variant: 'destructive'
      });
    } finally {
      setAutoRenewalLoading(false);
    }
  };

  const handleProcessBill = async () => {
    if (!messId || !credits) return;

    try {
      setProcessingBill(true);
      const response = await messBillingService.processMonthlyBill(messId);
      
      if (response.success) {
        const creditsDeducted = response.data?.creditsDeducted || 0;
        const remainingCredits = response.data?.remainingCredits || 0;
        
        toast({
          title: '✅ Bill Paid Successfully!',
          description: `Monthly bill of ${creditsDeducted} credits has been paid. Remaining credits: ${remainingCredits}`,
        });
        
        // Refresh data to show updated information
        await fetchData();
      }
    } catch (error: any) {
      toast({
        title: '❌ Payment Failed',
        description: error.message || 'Failed to process bill. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessingBill(false);
    }
  };

  const handleActivateTrial = async () => {
    try {
      setActivatingTrial(true);
      const response = await freeTrialService.activateTrial();
      
      if (response.success) {
        toast({
          title: 'Free Trial Activated!',
          description: response.message || 'Your free trial has been activated successfully.',
        });
        
        // Refresh data to show trial status
        await fetchData();
        await checkTrialAvailability();
      }
    } catch (error: any) {
      console.error('Trial activation error:', error);
      toast({
        title: 'Activation Failed',
        description: error.message || 'Failed to activate free trial. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setActivatingTrial(false);
    }
  };

  const handlePurchaseCredits = async (planId: string) => {
    if (!user || !messProfile) {
      toast({
        title: 'Error',
        description: 'User information not available',
        variant: 'destructive'
      });
      return;
    }

    try {
      setPurchasingPlanId(planId);

      // Get user details for payment
      const userDetails = {
        name: `${user.firstName} ${user.lastName}`.trim() || messProfile.name || 'User',
        email: user.email || '',
        contact: user.phone || ''
      };

      // Initiate Razorpay payment
      const result = await paymentService.purchaseCredits({
        planId,
        userDetails
      });

      if (result.success) {
        toast({
          title: 'Payment Successful!',
          description: result.message || `${result.creditsAdded} credits have been added to your account`,
        });
        
        // Refresh data to show updated credits
        await fetchData();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to complete payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setPurchasingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-muted-foreground">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load subscription data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        pageTitle="Platform Subscription"
        pageDescription="Manage your credits, view billing, and purchase credit packages"
      >
        <Badge 
          variant="default" 
          className={
            credits.status === 'active' ? 'bg-green-600' : 
            credits.status === 'trial' ? 'bg-blue-600' : 
            credits.status === 'suspended' ? 'bg-orange-600' : 
            'bg-red-600'
          }
        >
          {credits.status.charAt(0).toUpperCase() + credits.status.slice(1)}
        </Badge>
      </PageHeader>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Trial Banner */}
        {credits.isTrialActive && credits.trialEndDate && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong>Free Trial Active!</strong> You have full access to all features. Trial ends on {format(new Date(credits.trialEndDate), 'PPP')}.
            </AlertDescription>
          </Alert>
        )}

        {/* Trial Expired Banner */}
        {!credits.isTrialActive && credits.trialEndDate && new Date(credits.trialEndDate) < new Date() && credits.totalCredits === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <strong>Trial Period Ended!</strong> Your free trial has expired. Please purchase credits to continue using the platform.
            </AlertDescription>
          </Alert>
        )}

        {/* Low Credit Warning */}
        {credits.availableCredits < credits.lowCreditThreshold && !credits.isTrialActive && (
          <Alert>
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <strong>Low Credit Warning!</strong> Your credits are running low. Consider purchasing more credits to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        {/* Credit Overview Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <Card className="border border-border bg-card">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg text-foreground">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="truncate">Available Credits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{credits.availableCredits}</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Ready to use</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg text-foreground">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                <span className="truncate">Used Credits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{credits.usedCredits}</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Monthly usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Info Card */}
        <Card className="border border-border bg-card">
          <CardHeader className="px-3 sm:px-6 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base md:text-lg text-foreground">Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Users</p>
                <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1">{currentUserCount}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Next Billing Amount</p>
                <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1">{nextBillingAmount} credits</p>
              </div>
              {credits.nextBillingDate && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Next Billing Date</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1 break-words">{format(new Date(credits.nextBillingDate), 'PP')}</p>
                </div>
              )}
              {credits.lastBillingDate && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Last Billing Date</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1 break-words">{format(new Date(credits.lastBillingDate), 'PP')}</p>
                </div>
              )}
              {credits.lastBillingAmount && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Last Bill Amount</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1">{credits.lastBillingAmount} credits</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 col-span-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">Auto-Renewal</p>
                  <Badge className={`text-xs sm:text-sm ${credits.autoRenewal ? 'bg-green-600' : 'bg-gray-500'}`}>
                    {credits.autoRenewal ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {autoRenewalLoading && (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={credits.autoRenewal}
                    onCheckedChange={handleToggleAutoRenewal}
                    disabled={autoRenewalLoading}
                    aria-label="Toggle auto-renewal"
                  />
                </div>
              </div>
            </div>
            {!credits.isTrialActive && (
              <div className="pt-3 sm:pt-4 border-t">
                <Button 
                  onClick={handleProcessBill} 
                  className="w-full text-sm sm:text-base h-9 sm:h-10"
                  disabled={processingBill || nextBillingAmount === 0}
                >
                  {processingBill ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    'Pay Monthly Bill'
                  )}
                </Button>
                {nextBillingAmount === 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                    No pending bill to pay
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="purchase" className="space-y-6">
          <TabsList className="!flex !space-x-1 !bg-card !rounded-lg !p-1 !border !border-border w-full sm:w-auto shadow-sm !h-auto !items-center !justify-start">
            <TabsTrigger 
              value="purchase" 
              className="!flex items-center gap-2 flex-1 sm:flex-none !px-4 !py-2 !rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-none !bg-transparent !whitespace-normal"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Purchase Credits</span>
              <span className="sm:hidden">Purchase</span>
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="!flex items-center gap-2 flex-1 sm:flex-none !px-4 !py-2 !rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-none !bg-transparent !whitespace-normal"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Billing History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Purchase Credits Tab */}
          <TabsContent value="purchase" className="space-y-6">
            {/* Trial Used Message */}


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Free Trial Plan Card - Show if available OR already used/active */}
              {(trialAvailable || credits.trialEndDate) && (
                <Card 
                  className={`hover:shadow-lg transition-shadow ${
                    credits.isTrialActive 
                      ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950/20' 
                      : trialAvailable
                      ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'opacity-60'
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-center">
                      <Badge className={
                        credits.isTrialActive ? 'bg-green-600' : 
                        trialAvailable ? 'bg-blue-600' : 
                        'bg-gray-500'
                      }>
                        {credits.isTrialActive ? 'Active' : trialAvailable ? 'Available' : 'Used'}
                      </Badge>
                    </div>
                    <CardTitle className="text-center">Free Trial</CardTitle>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">₹0</div>
                      <p className="text-muted-foreground mt-2">Full Platform Access</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Trial Period:</span>
                        <span className="font-medium">
                          {credits.trialStartDate && credits.trialEndDate 
                            ? `${Math.ceil((new Date(credits.trialEndDate).getTime() - new Date(credits.trialStartDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : '7 days'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          credits.isTrialActive ? 'text-green-600' : 
                          trialAvailable ? 'text-blue-600' : 
                          'text-muted-foreground'
                        }`}>
                          {credits.isTrialActive ? 'Active' : trialAvailable ? 'Available' : 'Expired'}
                        </span>
                      </div>
                      {credits.isTrialActive && credits.trialEndDate && (
                        <div className="flex justify-between text-sm">
                          <span>Ends On:</span>
                          <span className="font-medium">{format(new Date(credits.trialEndDate), 'PP')}</span>
                        </div>
                      )}
                      {!credits.isTrialActive && credits.trialEndDate && (
                        <div className="flex justify-between text-sm">
                          <span>Ended On:</span>
                          <span className="font-medium">{format(new Date(credits.trialEndDate), 'PP')}</span>
                        </div>
                      )}
                    </div>
                    
                    {trialAvailable && !credits.isTrialActive ? (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleActivateTrial}
                        disabled={activatingTrial}
                      >
                        {activatingTrial ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Activating...
                          </>
                        ) : (
                          'Activate Free Trial'
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        variant={credits.isTrialActive ? 'default' : 'outline'}
                        disabled={!credits.isTrialActive}
                      >
                        {credits.isTrialActive ? 'Currently Active' : 'Already Used'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Paid Plans */}
              {plans.length > 0 ? (
                plans.map((plan, index) => (
                  <Card 
                    key={plan._id} 
                    className={`hover:shadow-xl transition-all duration-300 border bg-card ${index === 1 ? 'border-2 border-primary shadow-md' : 'border-border'}`}
                  >
                    <CardHeader className="pb-3">
                      {index === 1 && (
                        <div className="flex justify-center mb-2">
                          <Badge className="bg-primary text-primary-foreground px-3 py-1">Most Popular</Badge>
                        </div>
                      )}
                      <CardTitle className="text-center text-lg sm:text-xl font-bold">{plan.name}</CardTitle>
                      <div className="text-center mt-4">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl sm:text-3xl font-semibold text-muted-foreground">₹</span>
                          <div className="text-4xl sm:text-5xl font-bold text-green-600">{plan.price}</div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">One-time payment</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Credits Breakdown */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Base Credits:</span>
                          <span className="font-semibold text-foreground">{plan.baseCredits.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Bonus Credits:</span>
                          <span className="font-semibold text-green-600">+{plan.bonusCredits.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border pt-2.5 mt-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">Total Credits:</span>
                            <span className="text-lg font-bold text-green-600">{plan.totalCredits.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {plan.description && 
                       plan.description.length < 200 && 
                       plan.description.length > 0 && 
                       /^[a-zA-Z0-9\s.,!?()-]+$/.test(plan.description) && (
                        <div className="pt-2">
                          <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">{plan.description}</p>
                        </div>
                      )}

                      {/* Purchase Button */}
                      <Button 
                        className={`w-full h-10 sm:h-11 text-sm sm:text-base font-semibold ${index === 1 ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                        onClick={() => handlePurchaseCredits(plan._id)}
                        disabled={purchasingPlanId === plan._id}
                        variant={index === 1 ? 'default' : 'outline'}
                      >
                        {purchasingPlanId === plan._id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Purchase Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-base font-medium">No credit plans available</p>
                  <p className="text-sm mt-2">Please check back later for available plans</p>
                </div>
              )}
            </div>

            {/* How Credits Work */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">How Credits Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-foreground">Credits are deducted monthly based on your active user count</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-foreground">Bonus credits are added automatically upon purchase</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-foreground">Enable auto-renewal to automatically pay your monthly bill</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-foreground">Low credit alerts keep you informed</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction._id} 
                        className="flex items-center justify-between p-4 border rounded-lg border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                transaction.type === 'purchase' ? 'bg-green-600' :
                                transaction.type === 'deduction' ? 'bg-red-600' :
                                transaction.type === 'bonus' ? 'bg-blue-600' :
                                'bg-gray-600'
                              }
                            >
                              {transaction.type}
                            </Badge>
                            <span className="font-medium text-foreground">{transaction.description}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(transaction.createdAt), 'PPP p')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            transaction.type === 'purchase' || transaction.type === 'bonus' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'purchase' || transaction.type === 'bonus' ? '+' : '-'}
                            {transaction.amount}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Balance: {transaction.balanceAfter}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p>No transactions yet</p>
                    <p className="text-sm mt-2">Your billing history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MessOwnerSubscription;

