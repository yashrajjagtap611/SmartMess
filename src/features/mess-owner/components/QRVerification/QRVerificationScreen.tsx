import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCodeIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import CommonHeader from '@/components/common/Header/CommonHeader';
import { useTheme } from '@/components/theme/theme-provider';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import messQRService, { MessInfo, MessQRCodeResult, VerificationStats } from '@/services/api/messQRService';

const QRVerificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkTheme: isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messInfo, setMessInfo] = useState<MessInfo | null>(null);
  const [qrCodeResult, setQRCodeResult] = useState<MessQRCodeResult | null>(null);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    loadMessProfile();
  }, []);

  const loadMessProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const mess = await messQRService.getMyMess();
      setMessInfo(mess);
      
      console.log('📦 Mess profile loaded:', mess);
      console.log('🔍 QR Code in profile:', (mess as any).qrCode);
      
      // Check if QR code exists in mess profile
      if ((mess as any).qrCode?.image && (mess as any).qrCode?.data) {
        console.log('✅ Found existing QR code, loading...');
        console.log('Generated at:', (mess as any).qrCode.generatedAt);
        setQRCodeResult({
          qrCode: (mess as any).qrCode.image,
          qrCodeData: (mess as any).qrCode.data,
          expiresAt: null,
          isNew: false
        });
      } else {
        console.log('ℹ️ No existing QR code found');
        console.log('Reason: qrCode field is', (mess as any).qrCode ? 'incomplete' : 'missing');
      }
      
      // Load stats
      try {
        const statsData = await messQRService.getVerificationStats(mess._id);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load mess profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (forceRegenerate = false) => {
    if (!messInfo) return;

    try {
      setGeneratingQR(true);
      setError(null);
      const result = await messQRService.generateMessQR(messInfo._id, forceRegenerate);
      setQRCodeResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDeleteQR = async () => {
    if (!messInfo || !confirm('Are you sure you want to delete this QR code? You can generate a new one anytime.')) return;

    try {
      setGeneratingQR(true);
      setError(null);
      await messQRService.deleteMessQR(messInfo._id);
      setQRCodeResult(null);
      alert('QR code deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!confirm('Are you sure you want to generate a new QR code? The old QR code will stop working.')) return;
    await handleGenerateQR(true);
  };

  const handleDownloadQR = () => {
    if (!qrCodeResult) return;

    const link = document.createElement('a');
    link.href = qrCodeResult.qrCode;
    link.download = `${messInfo?.name || 'mess'}-verification-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQR = () => {
    window.print();
  };

  const handleShareProfile = () => {
    if (!messInfo) return;
    
    const shareUrl = `${window.location.origin}/mess/${messInfo._id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Profile link copied!

${shareUrl}

Share this link with potential customers to view your mess profile and meal plans.`);
    }).catch(() => {
      // Fallback: show the URL in a prompt
      prompt('Copy this link to share your mess profile:', shareUrl);
    });
  };

  // Unused function - commented out
  // const handlePrintForQR = () => {
  //   if (!qrCodeResult || !messInfo) return;
  //   const printWindow = window.open('', '', 'width=800,height=600');
  //   if (!printWindow) return;
  //   printWindow.document.write(`...`);
  //   printWindow.document.close();
  //   printWindow.print();
  // };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  if (loading) {
    return (
      <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleTheme}
          handleLogout={handleLogout}
        />
        <div className="transition-all duration-300 lg:ml-90">
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="SmartMess-light-text dark:SmartMess-dark-text">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleTheme}
        handleLogout={handleLogout}
      />
      
      <div className="transition-all duration-300 lg:ml-90">
        <CommonHeader
          title="QR Verification"
          subtitle="Generate QR code for member verification at mess entrance"
          variant="default"
        />

        <div className="p-6 pb-32 lg:pb-24">
          {/* Back Button */}
          <button
            onClick={() => navigate(ROUTES.MESS_OWNER.SETTINGS)}
            className="mb-6 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Settings</span>
          </button>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Members</p>
                    <p className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
                      {stats.activeMembers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
                      {stats.totalMembers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    <p className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text">
                      {stats.expiringSoon}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <div className="SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border rounded-xl p-8">
              {/* Mess Info */}
              {messInfo && (
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text mb-2">
                    {messInfo.name}
                  </h2>
                  {messInfo.location && (
                    <p className="text-muted-foreground">
                      {messInfo.location.city}, {messInfo.location.state}
                    </p>
                  )}
                </div>
              )}

              {/* QR Code Display */}
              {qrCodeResult ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-xl border-4 border-primary shadow-lg">
                      <img
                        src={qrCodeResult.qrCode}
                        alt="Verification QR Code"
                        className="w-80 h-80"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        onClick={handleDownloadQR}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download QR Code
                      </button>
                      <button
                        onClick={handlePrintQR}
                        className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        <PrinterIcon className="w-5 h-5" />
                        Print QR Code
                      </button>
                      <button
                        onClick={handleShareProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <ShareIcon className="w-5 h-5" />
                        Share Profile Link
                      </button>
                    </div>
                    
                    {/* Delete and Regenerate Buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        onClick={handleRegenerateQR}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <QrCodeIcon className="w-5 h-5" />
                        Regenerate QR Code
                      </button>
                      <button
                        onClick={handleDeleteQR}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                        Delete QR Code
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-3 flex items-center gap-2">
                      <QrCodeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      How to Use This QR Code
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Print this QR code and place it at your mess entrance or reception</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>Members can scan this code using the SmartMess mobile app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>The system will instantly verify if they have an active membership</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <span>This QR code never expires and can be used for all members</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-8 bg-muted/50 rounded-xl border-2 border-dashed border-border">
                      <QrCodeIcon className="w-32 h-32 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No QR code generated yet</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateQR(false)}
                    disabled={generatingQR || !messInfo}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                  >
                    {generatingQR ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCodeIcon className="w-5 h-5" />
                        Generate QR Code
                      </>
                    )}
                  </button>

                  {/* Info Box */}
                  <div className="mt-8 p-6 bg-muted/50 rounded-lg text-left">
                    <h3 className="font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-3">
                      About Verification QR Code
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a permanent QR code for your mess that members can scan to verify their active membership status. This is useful for:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Quick entry verification at mess entrance</li>
                      <li>• Offline verification without internet connectivity</li>
                      <li>• Preventing unauthorized access to mess facilities</li>
                      <li>• Easy member identification for staff</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleTheme}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default QRVerificationScreen;
