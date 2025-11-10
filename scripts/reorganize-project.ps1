# SmartMess Project Reorganization Script
# This script reorganizes the project structure according to best practices

param(
    [switch]$DryRun = $false,
    [switch]$Phase1 = $false,
    [switch]$Phase2 = $false,
    [switch]$Phase3 = $false,
    [switch]$All = $false
)

$ProjectRoot = "d:\love\MeesHub\mees-hub-auth\SmartMess"
$SrcPath = "$ProjectRoot\src"

function Write-Action {
    param($Action, $Source, $Destination)
    if ($DryRun) {
        Write-Host "[DRY RUN] $Action`: $Source -> $Destination" -ForegroundColor Yellow
    } else {
        Write-Host "$Action`: $Source -> $Destination" -ForegroundColor Green
    }
}

function Ensure-Directory {
    param($Path)
    if (-not (Test-Path $Path)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
        }
        Write-Action "CREATE DIR" "" $Path
    }
}

function Move-FileWithBackup {
    param($Source, $Destination)
    
    if (Test-Path $Source) {
        $DestDir = Split-Path $Destination -Parent
        Ensure-Directory $DestDir
        
        if (-not $DryRun) {
            Move-Item $Source $Destination -Force
        }
        Write-Action "MOVE" $Source $Destination
    } else {
        Write-Host "WARNING: Source file not found: $Source" -ForegroundColor Red
    }
}

function Copy-FileWithBackup {
    param($Source, $Destination)
    
    if (Test-Path $Source) {
        $DestDir = Split-Path $Destination -Parent
        Ensure-Directory $DestDir
        
        if (-not $DryRun) {
            Copy-Item $Source $Destination -Force
        }
        Write-Action "COPY" $Source $Destination
    } else {
        Write-Host "WARNING: Source file not found: $Source" -ForegroundColor Red
    }
}

function Phase1-CreatePagesStructure {
    Write-Host "`n=== PHASE 1: Creating Pages Structure ===" -ForegroundColor Cyan
    
    # Create pages directory structure
    $PagesDirectories = @(
        "$SrcPath\pages\auth",
        "$SrcPath\pages\user", 
        "$SrcPath\pages\mess-owner",
        "$SrcPath\pages\admin",
        "$SrcPath\pages\dev",
        "$SrcPath\pages\error"
    )
    
    foreach ($dir in $PagesDirectories) {
        Ensure-Directory $dir
    }
    
    # Move auth screens to pages
    $AuthScreenMoves = @{
        "$SrcPath\components\auth\screens\ForgotPasswordScreen.tsx" = "$SrcPath\pages\auth\ForgotPasswordPage.tsx"
        "$SrcPath\components\auth\screens\LoginScreen.tsx" = "$SrcPath\pages\auth\LoginPage.tsx"
        "$SrcPath\components\auth\screens\OtpVerificationScreen.tsx" = "$SrcPath\pages\auth\OtpVerificationPage.tsx"
        "$SrcPath\components\auth\screens\RegisterScreen.tsx" = "$SrcPath\pages\auth\RegisterPage.tsx"
        "$SrcPath\components\auth\screens\ResetPasswordScreen.tsx" = "$SrcPath\pages\auth\ResetPasswordPage.tsx"
        "$SrcPath\components\auth\screens\RoleSelection.tsx" = "$SrcPath\pages\auth\RoleSelectionPage.tsx"
        "$SrcPath\components\auth\screens\SplashScreen.tsx" = "$SrcPath\pages\auth\SplashPage.tsx"
        "$SrcPath\components\auth\screens\WelcomeScreen.tsx" = "$SrcPath\pages\auth\WelcomePage.tsx"
    }
    
    foreach ($move in $AuthScreenMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
    
    # Move user components to pages
    $UserPageMoves = @{
        "$SrcPath\components\user\UserDashboard.tsx" = "$SrcPath\pages\user\DashboardPage.tsx"
        "$SrcPath\components\user\Profile.tsx" = "$SrcPath\pages\user\ProfilePage.tsx"
        "$SrcPath\components\user\BillingPayments.tsx" = "$SrcPath\pages\user\BillingPage.tsx"
        "$SrcPath\components\user\Notifications.tsx" = "$SrcPath\pages\user\NotificationsPage.tsx"
        "$SrcPath\components\user\ChatCommunity.tsx" = "$SrcPath\pages\user\ChatPage.tsx"
    }
    
    foreach ($move in $UserPageMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
    
    # Move mess-owner main components to pages
    $MessOwnerPageMoves = @{
        "$SrcPath\components\mess-owner\MessOwnerDashboard\index.tsx" = "$SrcPath\pages\mess-owner\DashboardPage.tsx"
        "$SrcPath\components\mess-owner\Profile\index.tsx" = "$SrcPath\pages\mess-owner\ProfilePage.tsx"
        "$SrcPath\components\mess-owner\BillingPayments\index.tsx" = "$SrcPath\pages\mess-owner\BillingPage.tsx"
        "$SrcPath\components\mess-owner\ChatCommunity\index.tsx" = "$SrcPath\pages\mess-owner\ChatPage.tsx"
        "$SrcPath\components\mess-owner\FeedbackComplaints\index.tsx" = "$SrcPath\pages\mess-owner\FeedbackPage.tsx"
        "$SrcPath\components\mess-owner\LeaveManagement\index.tsx" = "$SrcPath\pages\mess-owner\LeaveManagementPage.tsx"

        "$SrcPath\components\mess-owner\ReportsAnalytics\index.tsx" = "$SrcPath\pages\mess-owner\ReportsPage.tsx"
        "$SrcPath\components\mess-owner\UserManagement\index.tsx" = "$SrcPath\pages\mess-owner\UserManagementPage.tsx"
        "$SrcPath\components\mess-owner\Services\index.tsx" = "$SrcPath\pages\mess-owner\ServicesPage.tsx"
        "$SrcPath\components\mess-owner\Settings\index.tsx" = "$SrcPath\pages\mess-owner\SettingsPage.tsx"
        "$SrcPath\components\mess-owner\SettingsScreen\SettingsScreen.tsx" = "$SrcPath\pages\mess-owner\SettingsMainPage.tsx"
    }
    
    foreach ($move in $MessOwnerPageMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
    
    # Move admin components to pages
    $AdminPageMoves = @{
        "$SrcPath\components\admin\AdminDashboard.tsx" = "$SrcPath\pages\admin\DashboardPage.tsx"
        "$SrcPath\components\admin\Profile.tsx" = "$SrcPath\pages\admin\ProfilePage.tsx"
        "$SrcPath\components\admin\BillingPayments.tsx" = "$SrcPath\pages\admin\BillingPage.tsx"
        "$SrcPath\components\admin\ChatCommunity.tsx" = "$SrcPath\pages\admin\ChatPage.tsx"
        "$SrcPath\components\admin\MessOwnerManagement.tsx" = "$SrcPath\pages\admin\MessOwnerManagementPage.tsx"
        "$SrcPath\components\admin\SubscriptionManagement.tsx" = "$SrcPath\pages\admin\SubscriptionManagementPage.tsx"
    }
    
    foreach ($move in $AdminPageMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
    
    # Move dev components to pages
    $DevPageMoves = @{
        "$SrcPath\components\dev\DataPersistenceTest.tsx" = "$SrcPath\pages\dev\DataPersistenceTestPage.tsx"
        "$SrcPath\components\dev\NetworkStatusTest.tsx" = "$SrcPath\pages\dev\NetworkStatusTestPage.tsx"
        "$SrcPath\components\dev\NotificationTestScreen.tsx" = "$SrcPath\pages\dev\NotificationTestPage.tsx"
        "$SrcPath\components\dev\PerformanceDashboard.tsx" = "$SrcPath\pages\dev\PerformancePage.tsx"
        "$SrcPath\components\dev\PWADebugScreen.tsx" = "$SrcPath\pages\dev\PWADebugPage.tsx"
        "$SrcPath\components\dev\PWATestScreen.tsx" = "$SrcPath\pages\dev\PWATestPage.tsx"
        "$SrcPath\components\dev\QuickLoginScreen.tsx" = "$SrcPath\pages\dev\QuickLoginPage.tsx"
    }
    
    foreach ($move in $DevPageMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
    
    # Create page index files
    Create-PageIndexFiles
}

function Create-PageIndexFiles {
    $AuthIndexContent = @"
export { default as ForgotPasswordPage } from './ForgotPasswordPage';
export { default as LoginPage } from './LoginPage';
export { default as OtpVerificationPage } from './OtpVerificationPage';
export { default as RegisterPage } from './RegisterPage';
export { default as ResetPasswordPage } from './ResetPasswordPage';
export { default as RoleSelectionPage } from './RoleSelectionPage';
export { default as SplashPage } from './SplashPage';
export { default as WelcomePage } from './WelcomePage';
"@

    $UserIndexContent = @"
export { default as DashboardPage } from './DashboardPage';
export { default as ProfilePage } from './ProfilePage';
export { default as BillingPage } from './BillingPage';
export { default as NotificationsPage } from './NotificationsPage';
export { default as ChatPage } from './ChatPage';
"@

    $MessOwnerIndexContent = @"
export { default as DashboardPage } from './DashboardPage';
export { default as ProfilePage } from './ProfilePage';
export { default as BillingPage } from './BillingPage';
export { default as ChatPage } from './ChatPage';
export { default as FeedbackPage } from './FeedbackPage';
export { default as LeaveManagementPage } from './LeaveManagementPage';

export { default as ReportsPage } from './ReportsPage';
export { default as UserManagementPage } from './UserManagementPage';
export { default as ServicesPage } from './ServicesPage';
export { default as SettingsPage } from './SettingsPage';
export { default as SettingsMainPage } from './SettingsMainPage';
"@

    $AdminIndexContent = @"
export { default as DashboardPage } from './DashboardPage';
export { default as ProfilePage } from './ProfilePage';
export { default as BillingPage } from './BillingPage';
export { default as ChatPage } from './ChatPage';
export { default as MessOwnerManagementPage } from './MessOwnerManagementPage';
export { default as SubscriptionManagementPage } from './SubscriptionManagementPage';
"@

    if (-not $DryRun) {
        $AuthIndexContent | Out-File "$SrcPath\pages\auth\index.ts" -Encoding UTF8
        $UserIndexContent | Out-File "$SrcPath\pages\user\index.ts" -Encoding UTF8
        $MessOwnerIndexContent | Out-File "$SrcPath\pages\mess-owner\index.ts" -Encoding UTF8
        $AdminIndexContent | Out-File "$SrcPath\pages\admin\index.ts" -Encoding UTF8
    }
    
    Write-Action "CREATE" "" "$SrcPath\pages\auth\index.ts"
    Write-Action "CREATE" "" "$SrcPath\pages\user\index.ts"
    Write-Action "CREATE" "" "$SrcPath\pages\mess-owner\index.ts"
    Write-Action "CREATE" "" "$SrcPath\pages\admin\index.ts"
}

function Phase2-CreateFeaturesStructure {
    Write-Host "`n=== PHASE 2: Creating Features Structure ===" -ForegroundColor Cyan
    
    # Create features directory structure
    $FeatureDirectories = @(
        "$SrcPath\features\auth\components",
        "$SrcPath\features\auth\hooks",
        "$SrcPath\features\auth\services",
        "$SrcPath\features\auth\types",
        "$SrcPath\features\auth\utils",
        "$SrcPath\features\auth\constants",
        "$SrcPath\features\user\components",
        "$SrcPath\features\user\hooks",
        "$SrcPath\features\user\services",
        "$SrcPath\features\user\types",
        "$SrcPath\features\user\utils",
        "$SrcPath\features\user\constants",
        "$SrcPath\features\mess-owner\components",
        "$SrcPath\features\mess-owner\hooks",
        "$SrcPath\features\mess-owner\services",
        "$SrcPath\features\mess-owner\types",
        "$SrcPath\features\mess-owner\utils",
        "$SrcPath\features\mess-owner\constants",
        "$SrcPath\features\admin\components",
        "$SrcPath\features\admin\hooks",
        "$SrcPath\features\admin\services",
        "$SrcPath\features\admin\types",
        "$SrcPath\features\admin\utils",
        "$SrcPath\features\admin\constants"
    )
    
    foreach ($dir in $FeatureDirectories) {
        Ensure-Directory $dir
    }
    
    # Move auth components
    Move-FileWithBackup "$SrcPath\components\auth\ProtectedRoute.tsx" "$SrcPath\features\auth\components\ProtectedRoute.tsx"
    Move-FileWithBackup "$SrcPath\components\auth\PublicRoute.tsx" "$SrcPath\features\auth\components\PublicRoute.tsx"
    
    # Move user components
    Move-FileWithBackup "$SrcPath\components\user\MessDetailsModal.tsx" "$SrcPath\features\user\components\MessDetailsModal.tsx"
    Move-FileWithBackup "$SrcPath\components\user\UPIQRCode.tsx" "$SrcPath\features\user\components\UPIQRCode.tsx"
    
    # Move services to features
    Move-FileWithBackup "$SrcPath\services\api\authService.ts" "$SrcPath\features\auth\services\authService.ts"
    Move-FileWithBackup "$SrcPath\services\api\userService.ts" "$SrcPath\features\user\services\userService.ts"
    Move-FileWithBackup "$SrcPath\services\api\messService.ts" "$SrcPath\features\mess-owner\services\messService.ts"
    Move-FileWithBackup "$SrcPath\services\api\adminService.ts" "$SrcPath\features\admin\services\adminService.ts"
    
    # Move types to features
    Move-FileWithBackup "$SrcPath\types\auth.ts" "$SrcPath\features\auth\types\auth.types.ts"
    Move-FileWithBackup "$SrcPath\types\user.ts" "$SrcPath\features\user\types\user.types.ts"
    Move-FileWithBackup "$SrcPath\types\mess.ts" "$SrcPath\features\mess-owner\types\mess.types.ts"
    
    # Move contexts to features
    Move-FileWithBackup "$SrcPath\contexts\UserContext.tsx" "$SrcPath\features\user\contexts\UserContext.tsx"
    Move-FileWithBackup "$SrcPath\contexts\MessProfileContext.tsx" "$SrcPath\features\mess-owner\contexts\MessProfileContext.tsx"
}

function Phase3-ReorganizeSharedComponents {
    Write-Host "`n=== PHASE 3: Reorganizing Shared Components ===" -ForegroundColor Cyan
    
    # Create shared components structure
    $SharedDirectories = @(
        "$SrcPath\components\shared\ui",
        "$SrcPath\components\shared\common",
        "$SrcPath\components\shared\layout",
        "$SrcPath\components\shared\feedback",
        "$SrcPath\components\shared\pwa",
        "$SrcPath\components\shared\theme"
    )
    
    foreach ($dir in $SharedDirectories) {
        Ensure-Directory $dir
    }
    
    # Move UI components to shared
    if (Test-Path "$SrcPath\components\ui") {
        if (-not $DryRun) {
            Move-Item "$SrcPath\components\ui\*" "$SrcPath\components\shared\ui\" -Force
        }
        Write-Action "MOVE DIR" "$SrcPath\components\ui\*" "$SrcPath\components\shared\ui\"
    }
    
    # Move common components
    $CommonMoves = @{
        "$SrcPath\components\common\ErrorBoundary.tsx" = "$SrcPath\components\shared\common\ErrorBoundary.tsx"
        "$SrcPath\components\common\NetworkStatus.tsx" = "$SrcPath\components\shared\common\NetworkStatus.tsx"
        "$SrcPath\components\common\NotificationBadge.tsx" = "$SrcPath\components\shared\common\NotificationBadge.tsx"
        "$SrcPath\components\common\NotificationPermission.tsx" = "$SrcPath\components\shared\common\NotificationPermission.tsx"
        "$SrcPath\components\common\PWAInstallPrompt.tsx" = "$SrcPath\components\shared\common\PWAInstallPrompt.tsx"
    }
    
    foreach ($move in $CommonMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
    
    # Move navbar to layout
    if (Test-Path "$SrcPath\components\common\Navbar") {
        if (-not $DryRun) {
            Move-Item "$SrcPath\components\common\Navbar" "$SrcPath\components\shared\layout\Navbar" -Force
        }
        Write-Action "MOVE DIR" "$SrcPath\components\common\Navbar" "$SrcPath\components\shared\layout\Navbar"
    }
    
    # Move other components
    Move-FileWithBackup "$SrcPath\components\loading\LoadingScreen.tsx" "$SrcPath\components\shared\feedback\LoadingScreen.tsx"
    Move-FileWithBackup "$SrcPath\components\offline\offline-content.tsx" "$SrcPath\components\shared\pwa\OfflineContent.tsx"
    Move-FileWithBackup "$SrcPath\components\pwa\install-button.tsx" "$SrcPath\components\shared\pwa\InstallButton.tsx"
    Move-FileWithBackup "$SrcPath\components\theme\theme-provider.tsx" "$SrcPath\components\shared\theme\ThemeProvider.tsx"
    
    # Move layouts
    $LayoutMoves = @{
        "$SrcPath\layouts\CommonLayout.tsx" = "$SrcPath\components\shared\layout\CommonLayout.tsx"
        "$SrcPath\layouts\MessOwnerLayout.tsx" = "$SrcPath\components\shared\layout\MessOwnerLayout.tsx"
        "$SrcPath\layouts\UserLayout.tsx" = "$SrcPath\components\shared\layout\UserLayout.tsx"
    }
    
    foreach ($move in $LayoutMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
}

function Phase4-ReorganizeHooksAndUtils {
    Write-Host "`n=== PHASE 4: Reorganizing Hooks and Utils ===" -ForegroundColor Cyan
    
    # Create hooks structure
    $HookDirectories = @(
        "$SrcPath\hooks\ui",
        "$SrcPath\hooks\business",
        "$SrcPath\hooks\api",
        "$SrcPath\hooks\auth"
    )
    
    foreach ($dir in $HookDirectories) {
        Ensure-Directory $dir
    }
    
    # Move hooks
    $HookMoves = @{
        "$SrcPath\hooks\use-mobile.ts" = "$SrcPath\hooks\ui\useMobile.ts"
        "$SrcPath\hooks\use-toast.ts" = "$SrcPath\hooks\ui\useToast.ts"
        "$SrcPath\hooks\useImagePreloader.ts" = "$SrcPath\hooks\ui\useImagePreloader.ts"
        "$SrcPath\hooks\useNotification.ts" = "$SrcPath\hooks\business\useNotification.ts"
    }
    
    foreach ($move in $HookMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
    
    # Create utils structure
    $UtilDirectories = @(
        "$SrcPath\utils\auth",
        "$SrcPath\utils\storage",
        "$SrcPath\utils\pwa",
        "$SrcPath\utils\websocket"
    )
    
    foreach ($dir in $UtilDirectories) {
        Ensure-Directory $dir
    }
    
    # Move utils
    $UtilMoves = @{
        "$SrcPath\utils\logout.ts" = "$SrcPath\utils\auth\logout.ts"
        "$SrcPath\utils\storageUtils.ts" = "$SrcPath\utils\storage\storageUtils.ts"
        "$SrcPath\utils\pwaService.ts" = "$SrcPath\utils\pwa\pwaService.ts"
        "$SrcPath\utils\websocketTest.ts" = "$SrcPath\utils\websocket\websocketTest.ts"
    }
    
    foreach ($move in $UtilMoves.GetEnumerator()) {
        Move-FileWithBackup $move.Key $move.Value
    }
}

function Create-UpdatedAppTsx {
    Write-Host "`n=== Creating Updated App.tsx ===" -ForegroundColor Cyan
    
    $AppTsxContent = @"
import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/shared/ui/toaster';
import { ThemeProvider } from '@/components/shared/theme/ThemeProvider';
import ErrorBoundary from '@/components/shared/common/ErrorBoundary';
import NetworkStatus from '@/components/shared/common/NetworkStatus';
import PWAInstallPrompt from '@/components/shared/common/PWAInstallPrompt';
import OfflineContent from '@/components/shared/pwa/OfflineContent';
import { pwaService } from '@/utils/pwa/pwaService';
import { ROUTES } from '@/constants/routes';
import CommonLayout from '@/components/shared/layout/CommonLayout';

// Auth Pages (not lazy for fast load)
import {
  SplashPage,
  WelcomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  OtpVerificationPage,
  RoleSelectionPage
} from '@/pages/auth';

// Route Guards
import { ProtectedRoute, PublicRoute } from '@/features/auth/components';

// User Pages
import {
  DashboardPage as UserDashboard,
  ProfilePage as UserProfile,
  BillingPage as UserBilling,
  NotificationsPage as UserNotifications,
  ChatPage as UserChat
} from '@/pages/user';

// Mess Owner Pages
import {
  DashboardPage as MessOwnerDashboard,
  ProfilePage as MessOwnerProfile,
  BillingPage as MessOwnerBilling,
  ChatPage as MessOwnerChat,
  FeedbackPage as MessOwnerFeedback,
  LeaveManagementPage as MessOwnerLeaveManagement,
  
  ReportsPage as MessOwnerReports,
  UserManagementPage as MessOwnerUserManagement,
  ServicesPage as MessOwnerServices,
  SettingsPage as MessOwnerSettings,
  SettingsMainPage as MessOwnerSettingsMain
} from '@/pages/mess-owner';

// Admin Pages
import {
  DashboardPage as AdminDashboard,
  ProfilePage as AdminProfile,
  BillingPage as AdminBilling,
  ChatPage as AdminChat,
  MessOwnerManagementPage as AdminMessOwnerManagement,
  SubscriptionManagementPage as AdminSubscriptionManagement
} from '@/pages/admin';

// Dev Pages (lazy load)
const PWATestPage = lazy(() => import('@/pages/dev/PWATestPage'));
const PWADebugPage = lazy(() => import('@/pages/dev/PWADebugPage'));
const NotificationTestPage = lazy(() => import('@/pages/dev/NotificationTestPage'));
const PerformancePage = lazy(() => import('@/pages/dev/PerformancePage'));
const DataPersistenceTestPage = lazy(() => import('@/pages/dev/DataPersistenceTestPage'));
const QuickLoginPage = lazy(() => import('@/pages/dev/QuickLoginPage'));

function App() {
  const [showOfflineContent, setShowOfflineContent] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Initialize PWA features
    const initializePWA = async () => {
      pwaService.onUpdateAvailable(() => {
        setUpdateAvailable(true);
        console.log('PWA: Update available');
      });
      if (pwaService.isInstallable()) {
        setShowInstallPrompt(true);
      }
    };
    initializePWA();
    window.addEventListener('online', () => setShowOfflineContent(false));
    window.addEventListener('offline', () => setShowOfflineContent(true));
    return () => {
      window.removeEventListener('online', () => setShowOfflineContent(false));
      window.removeEventListener('offline', () => setShowOfflineContent(true));
    };
  }, []);

  if (showOfflineContent) {
    return (
      <ThemeProvider defaultTheme="system">
        <OfflineContent 
          onRetry={() => window.location.reload()}
          onGoHome={() => window.location.href = '/'}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system">
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-background">
            {/* PWA Install Prompt */}
            {showInstallPrompt && (
              <PWAInstallPrompt 
                variant="banner"
                onDismiss={() => setShowInstallPrompt(false)}
                className="fixed top-4 left-4 right-4 z-50"
              />
            )}
            {/* Network Status Indicator */}
            <div className="fixed top-4 right-4 z-40">
              <NetworkStatus showDetails={false} />
            </div>
            {/* Update Available Notification */}
            {updateAvailable && (
              <div className="fixed bottom-4 left-4 right-4 z-50">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Update Available
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          A new version is ready to install
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          pwaService.applyUpdate();
                          setUpdateAvailable(false);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setUpdateAvailable(false)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Main App Routes */}
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.PUBLIC.ROOT} element={<PublicRoute element={<SplashPage />} />} />
                <Route path={ROUTES.PUBLIC.WELCOME} element={<PublicRoute element={<WelcomePage />} />} />
                <Route path={ROUTES.PUBLIC.LOGIN} element={<PublicRoute element={<LoginPage />} />} />
                <Route path={ROUTES.PUBLIC.REGISTER} element={<PublicRoute element={<RegisterPage />} />} />
                <Route path={ROUTES.PUBLIC.FORGOT_PASSWORD} element={<PublicRoute element={<ForgotPasswordPage />} />} />
                <Route path={ROUTES.PUBLIC.RESET_PASSWORD} element={<PublicRoute element={<ResetPasswordPage />} />} />
                <Route path={ROUTES.PUBLIC.OTP_VERIFICATION} element={<PublicRoute element={<OtpVerificationPage />} />} />
                <Route path={ROUTES.PUBLIC.ROLE_SELECTION} element={<PublicRoute element={<RoleSelectionPage />} />} />
                
                {/* User Routes */}
                <Route path={ROUTES.USER.DASHBOARD} element={<CommonLayout><ProtectedRoute element={<UserDashboard />} /></CommonLayout>} />
                <Route path={ROUTES.USER.PROFILE} element={<CommonLayout><ProtectedRoute element={<UserProfile />} /></CommonLayout>} />
                <Route path={ROUTES.USER.NOTIFICATIONS} element={<CommonLayout><ProtectedRoute element={<UserNotifications />} /></CommonLayout>} />
                <Route path={ROUTES.USER.BILLING} element={<CommonLayout><ProtectedRoute element={<UserBilling />} /></CommonLayout>} />
                <Route path={ROUTES.USER.CHAT} element={<CommonLayout><ProtectedRoute element={<UserChat />} /></CommonLayout>} />
                
                {/* Mess Owner Routes */}
                <Route path={ROUTES.MESS_OWNER.DASHBOARD} element={<CommonLayout><ProtectedRoute element={<MessOwnerDashboard />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.PROFILE} element={<CommonLayout><ProtectedRoute element={<MessOwnerProfile />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.BILLING} element={<CommonLayout><ProtectedRoute element={<MessOwnerBilling />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.CHAT} element={<CommonLayout><ProtectedRoute element={<MessOwnerChat />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.FEEDBACK} element={<CommonLayout><ProtectedRoute element={<MessOwnerFeedback />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.LEAVE} element={<CommonLayout><ProtectedRoute element={<MessOwnerLeaveManagement />} /></CommonLayout>} />
  
                <Route path={ROUTES.MESS_OWNER.REPORTS} element={<CommonLayout><ProtectedRoute element={<MessOwnerReports />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.USERS} element={<CommonLayout><ProtectedRoute element={<MessOwnerUserManagement />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.SERVICES} element={<CommonLayout><ProtectedRoute element={<MessOwnerServices />} /></CommonLayout>} />
                <Route path={ROUTES.MESS_OWNER.SETTINGS} element={<CommonLayout><ProtectedRoute element={<MessOwnerSettings />} /></CommonLayout>} />
                
                {/* Admin Routes */}
                <Route path={ROUTES.ADMIN.DASHBOARD} element={<CommonLayout><ProtectedRoute element={<AdminDashboard />} /></CommonLayout>} />
                <Route path={ROUTES.ADMIN.PROFILE} element={<CommonLayout><ProtectedRoute element={<AdminProfile />} /></CommonLayout>} />
                <Route path={ROUTES.ADMIN.BILLING} element={<CommonLayout><ProtectedRoute element={<AdminBilling />} /></CommonLayout>} />
                <Route path={ROUTES.ADMIN.CHAT} element={<CommonLayout><ProtectedRoute element={<AdminChat />} /></CommonLayout>} />
                <Route path={ROUTES.ADMIN.MESS_OWNERS} element={<CommonLayout><ProtectedRoute element={<AdminMessOwnerManagement />} /></CommonLayout>} />
                <Route path={ROUTES.ADMIN.SUBSCRIPTIONS} element={<CommonLayout><ProtectedRoute element={<AdminSubscriptionManagement />} /></CommonLayout>} />
                
                {/* Dev Routes (lazy) */}
                <Route path={ROUTES.DEV.PWA_TEST} element={<Suspense fallback={<div>Loading...</div>}><PWATestPage /></Suspense>} />
                <Route path={ROUTES.DEV.PWA_DEBUG} element={<Suspense fallback={<div>Loading...</div>}><PWADebugPage /></Suspense>} />
                <Route path={ROUTES.DEV.NOTIFICATION_TEST} element={<Suspense fallback={<div>Loading...</div>}><NotificationTestPage /></Suspense>} />
                <Route path={ROUTES.DEV.PERFORMANCE} element={<Suspense fallback={<div>Loading...</div>}><PerformancePage /></Suspense>} />
                <Route path={ROUTES.DEV.DATA_PERSISTENCE} element={<Suspense fallback={<div>Loading...</div>}><DataPersistenceTestPage /></Suspense>} />
                <Route path={ROUTES.DEV.QUICK_LOGIN} element={<Suspense fallback={<div>Loading...</div>}><QuickLoginPage /></Suspense>} />
                
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to={ROUTES.PUBLIC.ROOT} replace />} />
              </Routes>
            </Suspense>
            {/* Toast Notifications */}
            <Toaster />
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
"@

    if (-not $DryRun) {
        $AppTsxContent | Out-File "$SrcPath\App.tsx" -Encoding UTF8
    }
    Write-Action "UPDATE" "$SrcPath\App.tsx" "Updated with new import paths"
}

# Main execution
Write-Host "SmartMess Project Reorganization Script" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be moved" -ForegroundColor Yellow
}

if ($All -or $Phase1) {
    Phase1-CreatePagesStructure
}

if ($All -or $Phase2) {
    Phase2-CreateFeaturesStructure
}

if ($All -or $Phase3) {
    Phase3-ReorganizeSharedComponents
}

if ($All) {
    Phase4-ReorganizeHooksAndUtils
    Create-UpdatedAppTsx
}

if (-not ($Phase1 -or $Phase2 -or $Phase3 -or $All)) {
    Write-Host "Please specify which phase to run:" -ForegroundColor Red
    Write-Host "  -Phase1: Create pages structure" -ForegroundColor Yellow
    Write-Host "  -Phase2: Create features structure" -ForegroundColor Yellow
    Write-Host "  -Phase3: Reorganize shared components" -ForegroundColor Yellow
    Write-Host "  -All: Run all phases" -ForegroundColor Yellow
    Write-Host "  -DryRun: Preview changes without executing" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example: .\reorganize-project.ps1 -Phase1 -DryRun" -ForegroundColor Green
}

Write-Host "`nReorganization complete!" -ForegroundColor Green