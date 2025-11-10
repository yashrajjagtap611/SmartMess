import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MessProfileProvider } from './contexts/MessProfileContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Conditional wrapper for MessProfileProvider - only renders when authenticated
const ConditionalMessProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('authToken'));
  
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = !!localStorage.getItem('authToken');
      setIsAuthenticated(hasToken);
    };
    
    // Check auth on mount
    checkAuth();
    
    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Only render MessProfileProvider when authenticated
  if (isAuthenticated) {
    return <MessProfileProvider>{children}</MessProfileProvider>;
  }
  
  // Return children without MessProfileProvider when not authenticated
  return <>{children}</>;
};

import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import NetworkStatus from '@/components/common/NetworkStatus';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import OfflineContent from '@/components/offline/offline-content';
import { pwaService } from '@/utils/pwaService';
import { ROUTES } from '@/constants/routes';
import CommonLayout from '@/layouts/CommonLayout';
import OfflineBanner from '@/components/common/OfflineBanner';
import { toast } from '@/hooks/use-toast';
import WithSubscriptionCheck from '@/components/common/WithSubscriptionCheck';

// Auth Screens (not lazy for fast load)
import SplashScreen from '@/features/auth/components/SplashScreen';
import WelcomeScreen from '@/features/auth/components/WelcomeScreen';
import LoginScreen from '@/features/auth/components/LoginScreen';
import RegisterScreen from '@/features/auth/components/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/components/ForgotPasswordScreen';
import ResetPasswordScreen from '@/features/auth/components/ResetPasswordScreen';
import PublicMessProfile from '@/pages/PublicMessProfile';
import OtpVerificationScreen from '@/features/auth/components/OtpVerificationScreen';
import RoleSelection from '@/features/auth/components/RoleSelection';
import ProtectedRoute from '@/features/auth/ProtectedRoute';
import PublicRoute from '@/features/auth/PublicRoute';

// Barrel imports for feature pages
import {
  MessOwnerDashboard,
  MessOwnerProfile,
  MessOwnerBillingMemberDetail
} from '@/features/mess-owner';
import {
  UserDashboard,
  UserProfile,
  UserNotifications,
  UserBillingPayments,
  UserMenuDetail,
  UserApplyLeave,
  PaymentOptions,
  UserHowToUse
} from '@/features/user';
import InvoicePreviewPage from '@/features/user/components/BillingPayments/pages/InvoicePreviewPage';
import MealScannerPage from '@/features/user/components/MealScannerPage/MealScannerPage';
import PaymentVerificationDetail from '@/features/mess-owner/components/BillingPayments/components/PaymentVerificationDetail';
import { ChatCommunity, ChatProvider } from '@/features/ChatCommunity';
import {
  AdminDashboard,
  AdminProfile,
  AdminBillingPayments,
  AdminMessOwnerManagement,
  AdminSubscriptionManagement,
  AdminNotification,
  AdminUserManagement,
  AdminSystemMonitoring,
  AdminSettings,
  DefaultMealPlans,
  TutorialVideosManagement,
  AdminAdSettings
} from '@/features/admin';  

// Mess Owner Settings Components (not lazy for now)
import MessProfile from '@/features/mess-owner/components/Settings/MessProfile';
import MealPlan from '@/features/mess-owner/components/Settings/MealPlan';
import OperatingHours from '@/features/mess-owner/components/Settings/OperatingHours';
import Payment from '@/features/mess-owner/components/Settings/Payment';
import Security from '@/features/mess-owner/components/Settings/Security';
import QRVerificationScreen from '@/features/mess-owner/components/QRVerification/QRVerificationScreen';

// Dev Components (lazy load)
const PWATestScreen = lazy(() => import('@/components/dev/PWATestScreen'));
const PWADebugScreen = lazy(() => import('@/components/dev/PWADebugScreen'));
const NotificationTestScreen = lazy(() => import('@/components/dev/NotificationTestScreen'));
const PerformanceDashboard = lazy(() => import('@/components/dev/PerformanceDashboard'));
const DataPersistenceTest = lazy(() => import('@/components/dev/DataPersistenceTest'));
const QuickLoginScreen = lazy(() => import('@/components/dev/QuickLoginScreen'));
const AuthDebug = lazy(() => import('@/components/dev/AuthDebug'));
import FeedbackComplaintsDemo from '@/pages/FeedbackComplaintsDemo';

function App() {
  const [showOfflineContent, setShowOfflineContent] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let pwaInitialized = false;
    
    // Initialize PWA features ONCE on mount with debouncing
    const initializePWA = async () => {
      if (!isMounted || pwaInitialized) return;
      pwaInitialized = true;
      
      try {
        pwaService.onUpdateAvailable(() => {
          if (!isMounted) return;
          console.log('PWA: Update available');
          // Show toast with Update action
          toast({
            title: 'Update available',
            description: 'A new version is ready to install.',
            action: (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    pwaService.applyUpdate();
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => {}}
                  className="text-xs text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Later
                </button>
              </div>
            )
          });
        });
        
        if (isMounted && pwaService.isInstallable()) {
          setShowInstallPrompt(true);
        }
      } catch (error) {
        console.warn('PWA initialization failed:', error);
      }
    };
    
    // Debounce PWA initialization
    const timeoutId = setTimeout(initializePWA, 100);
    
    const handleOnline = () => {
      if (!isMounted) return;
      setShowOfflineContent(false);
      console.log('App: Back online');
    };
    
    const handleOffline = () => {
      if (!isMounted) return;
      // Check auth status at the time of going offline, not from state
      const hasAuthToken = !!localStorage.getItem('authToken');
      if (!hasAuthToken) {
        setShowOfflineContent(true);
        console.log('App: Offline and not authenticated');
      } else {
        console.log('App: Offline but authenticated - allowing offline mode');
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show offline content for non-authenticated users
  // Check auth from localStorage directly to avoid state dependency
  if (showOfflineContent && !localStorage.getItem('authToken')) {
    return (
      <OfflineContent 
        onRetry={() => window.location.reload()}
        onGoHome={() => window.location.href = '/'}
      />
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ConditionalMessProfileProvider>
          <NotificationProvider>

              <Router key="main-router">
                <div className="min-h-screen bg-background" key="app-container">
          {/* Offline Banner for Authenticated Users */}
          <OfflineBanner className="fixed top-0 left-0 right-0 z-50 rounded-none border-t-0 border-l-0 border-r-0" />
          
          {/* PWA Install Prompt */}
          {showInstallPrompt && (
            <PWAInstallPrompt 
              variant="banner"
              onDismiss={() => setShowInstallPrompt(false)}
              className="fixed top-0 left-4 right-4 z-40 mt-16"
            />
          )}
          {/* Network Status Indicator */}
          <div className="fixed top-4 right-4 z-40 mt-16">
            <NetworkStatus showDetails={false} />
          </div>
          {/* Update toast handled via use-toast */}
          {/* Main App Routes */}
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>} key="main-routes">
            <Routes key="routes-container">
            {/* Public Routes */}
              <Route path={ROUTES.PUBLIC.ROOT} element={<PublicRoute element={<SplashScreen />} />} />
              <Route path={ROUTES.PUBLIC.WELCOME} element={<PublicRoute element={<WelcomeScreen />} />} />
              <Route path={ROUTES.PUBLIC.LOGIN} element={<PublicRoute element={<LoginScreen />} />} />
              <Route path={ROUTES.PUBLIC.REGISTER} element={<PublicRoute element={<RegisterScreen />} />} />
              <Route path={ROUTES.PUBLIC.FORGOT_PASSWORD} element={<PublicRoute element={<ForgotPasswordScreen />} />} />
              <Route path={ROUTES.PUBLIC.RESET_PASSWORD} element={<PublicRoute element={<ResetPasswordScreen />} />} />
              <Route path={ROUTES.PUBLIC.OTP_VERIFICATION} element={<PublicRoute element={<OtpVerificationScreen />} />} />
              <Route path={ROUTES.PUBLIC.ROLE_SELECTION} element={<PublicRoute element={<RoleSelection />} />} />
              <Route path={ROUTES.PUBLIC.MESS_PROFILE} element={<PublicMessProfile />} />
              {/* User Routes */}
              <Route path={ROUTES.USER.DASHBOARD} element={<CommonLayout><ProtectedRoute element={<UserDashboard />} /></CommonLayout>} />
              <Route path={ROUTES.USER.PROFILE} element={<CommonLayout><ProtectedRoute element={<UserProfile />} /></CommonLayout>} />
              <Route path={ROUTES.USER.NOTIFICATIONS} element={<CommonLayout><ProtectedRoute element={<UserNotifications />} allowedRoles={['user']} /></CommonLayout>} />
              <Route path={ROUTES.USER.BILLING} element={<CommonLayout><ProtectedRoute element={<UserBillingPayments />} /></CommonLayout>} />
              <Route path={ROUTES.USER.INVOICE_PREVIEW} element={<CommonLayout><ProtectedRoute element={<InvoicePreviewPage />} /></CommonLayout>} />
              <Route path={ROUTES.USER.APPLY_LEAVE} element={<CommonLayout><ProtectedRoute element={<UserApplyLeave />} /></CommonLayout>} />
              <Route path={ROUTES.USER.MEAL_SCANNER} element={<CommonLayout><ProtectedRoute element={<MealScannerPage />} /></CommonLayout>} />
              <Route path={ROUTES.USER.PAYMENT_OPTIONS} element={<CommonLayout><ProtectedRoute element={<PaymentOptions />} /></CommonLayout>} />
              <Route path={ROUTES.USER.CHAT} element={<CommonLayout><ProtectedRoute element={<ChatProvider><ChatCommunity /></ChatProvider>} /></CommonLayout>} />
              <Route path={ROUTES.USER.MENU_DETAIL} element={<CommonLayout><ProtectedRoute element={<UserMenuDetail />} /></CommonLayout>} />
              <Route path={ROUTES.USER.HOW_TO_USE} element={<CommonLayout><ProtectedRoute element={<UserHowToUse userRole="user" />} /></CommonLayout>} />
              {/* Mess Owner Routes */}
              {/* Main Dashboard - Handles nested routes */}
              <Route path={ROUTES.MESS_OWNER.DASHBOARD} element={<CommonLayout><ProtectedRoute element={<MessOwnerDashboard />} /></CommonLayout>} />
              
              {/* Standalone Routes (not nested in dashboard) */}
              <Route path={ROUTES.MESS_OWNER.PROFILE} element={<CommonLayout><ProtectedRoute element={<MessOwnerProfile />} /></CommonLayout>} />
              <Route path={ROUTES.MESS_OWNER.BILLING_MEMBER_DETAIL} element={<CommonLayout><ProtectedRoute element={<WithSubscriptionCheck blockAccess={true}><MessOwnerBillingMemberDetail /></WithSubscriptionCheck>} /></CommonLayout>} />
              <Route path={ROUTES.MESS_OWNER.PAYMENT_VERIFICATION_DETAIL} element={<CommonLayout><ProtectedRoute element={<WithSubscriptionCheck blockAccess={true}><PaymentVerificationDetail /></WithSubscriptionCheck>} /></CommonLayout>} />
              {/* Mess Owner Settings Nested Routes */}
              <Route path={ROUTES.MESS_OWNER.SETTINGS_PROFILE} element={<CommonLayout><ProtectedRoute element={<MessProfile />} /></CommonLayout>} />
              <Route path={ROUTES.MESS_OWNER.SETTINGS_MEAL_PLANS} element={<CommonLayout><ProtectedRoute element={<MealPlan />} /></CommonLayout>} />
              <Route path={ROUTES.MESS_OWNER.SETTINGS_OPERATING_HOURS} element={<CommonLayout><ProtectedRoute element={<OperatingHours />} /></CommonLayout>} />
              <Route path={ROUTES.MESS_OWNER.SETTINGS_PAYMENT} element={<CommonLayout><ProtectedRoute element={<Payment />} /></CommonLayout>} />
              <Route path={ROUTES.MESS_OWNER.SETTINGS_SECURITY} element={<CommonLayout><ProtectedRoute element={<Security />} /></CommonLayout>} />
              <Route path={ROUTES.MESS_OWNER.SETTINGS_QR_VERIFICATION} element={<CommonLayout><ProtectedRoute element={<QRVerificationScreen />} /></CommonLayout>} />
              {/* Admin Routes */}
              <Route path={ROUTES.ADMIN.DASHBOARD} element={<CommonLayout><ProtectedRoute element={<AdminDashboard />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.USER_MANAGEMENT} element={<CommonLayout><ProtectedRoute element={<AdminUserManagement />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.MESS_OWNERS} element={<CommonLayout><ProtectedRoute element={<AdminMessOwnerManagement />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.DEFAULT_MEAL_PLANS} element={<CommonLayout><ProtectedRoute element={<DefaultMealPlans />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.BILLING} element={<CommonLayout><ProtectedRoute element={<AdminBillingPayments />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.SYSTEM_MONITORING} element={<CommonLayout><ProtectedRoute element={<AdminSystemMonitoring />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.SETTINGS} element={<CommonLayout><ProtectedRoute element={<AdminSettings />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.AD_SETTINGS} element={<CommonLayout><ProtectedRoute element={<AdminAdSettings />} allowedRoles={['admin']} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.PROFILE} element={<CommonLayout><ProtectedRoute element={<AdminProfile />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.SUBSCRIPTIONS} element={<CommonLayout><ProtectedRoute element={<AdminSubscriptionManagement />} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.NOTIFICATIONS} element={<CommonLayout><ProtectedRoute element={<AdminNotification />} allowedRoles={['admin']} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.CHAT} element={<CommonLayout><ProtectedRoute element={<ChatProvider><ChatCommunity /></ChatProvider>} /></CommonLayout>} />
              <Route path={ROUTES.ADMIN.TUTORIAL_VIDEOS} element={<CommonLayout><ProtectedRoute element={<TutorialVideosManagement />} /></CommonLayout>} />
              {/* Dev Routes (lazy) */}
              <Route path={ROUTES.DEV.PWA_TEST} element={<Suspense fallback={<div>Loading...</div>}><PWATestScreen /></Suspense>} />
              <Route path={ROUTES.DEV.PWA_DEBUG} element={<Suspense fallback={<div>Loading...</div>}><PWADebugScreen /></Suspense>} />
              <Route path={ROUTES.DEV.NOTIFICATION_TEST} element={<Suspense fallback={<div>Loading...</div>}><NotificationTestScreen /></Suspense>} />
              <Route path={ROUTES.DEV.PERFORMANCE} element={<Suspense fallback={<div>Loading...</div>}><PerformanceDashboard /></Suspense>} />
              <Route path={ROUTES.DEV.DATA_PERSISTENCE} element={<Suspense fallback={<div>Loading...</div>}><DataPersistenceTest /></Suspense>} />
              <Route path={ROUTES.DEV.QUICK_LOGIN} element={<Suspense fallback={<div>Loading...</div>}><QuickLoginScreen /></Suspense>} />
              <Route path="/auth-debug" element={<AuthDebug />} />
              <Route path="/feedback-demo" element={<CommonLayout><FeedbackComplaintsDemo /></CommonLayout>} />
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to={ROUTES.PUBLIC.ROOT} replace />} />
          </Routes>
          </Suspense>
          {/* Toast Notifications */}
          <Toaster />
        </div>
      </Router>

          </NotificationProvider>
        </ConditionalMessProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;