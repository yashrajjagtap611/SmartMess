import { useState, useEffect } from "react";
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useToast } from '@/hooks/use-toast';
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ServerStackIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  autoBackupEnabled: boolean;
  backupRetentionDays: number;
}

const AdminSettings: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'security' | 'system' | 'backup'>('security');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'SmartMess',
    siteDescription: 'Complete Mess Management Solution',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    autoBackupEnabled: true,
    backupRetentionDays: 30
  });

  const handleLogout = () => {
    alert("Logged out!");
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSecuritySettings(data.data.security || securitySettings);
          setSystemSettings(data.data.system || systemSettings);
        }
      }
    } catch (err) {
      setError('Failed to fetch settings');
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type: string, settings: any) => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/admin/settings/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setSuccess(`${type} settings saved successfully`);
        toast({
          title: "Success",
          description: `${type} settings saved successfully`,
          variant: "default",
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to save settings');
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const tabs = [
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'system', label: 'System', icon: Cog6ToothIcon },
    { id: 'backup', label: 'Backup', icon: ServerStackIcon }
  ];

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="lg:ml-90 transition-all duration-300">
        <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-6 px-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  Admin Settings
                </h1>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Configure system security and general settings
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 pb-24">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700 dark:text-green-300">{success}</span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-SmartMess-primary text-SmartMess-primary'
                          : 'border-transparent text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-SmartMess-primary"></div>
            </div>
          ) : (
            <>
              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg p-6 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-6 flex items-center">
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Security Configuration
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                          Two-Factor Authentication
                        </label>
                        <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                          Require 2FA for admin accounts
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorEnabled}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                          Session Timeout (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-SmartMess-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-SmartMess-primary"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                      <h4 className="text-md font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4 flex items-center">
                        <KeyIcon className="w-4 h-4 mr-2" />
                        Password Policy
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                            Minimum Length
                          </label>
                          <input
                            type="number"
                            min="6"
                            max="32"
                            value={securitySettings.passwordPolicy.minLength}
                            onChange={(e) => setSecuritySettings(prev => ({
                              ...prev,
                              passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                            }))}
                            className="w-full px-3 py-2 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-SmartMess-primary"
                          />
                        </div>

                        <div className="space-y-3">
                          {[
                            { key: 'requireUppercase', label: 'Require Uppercase' },
                            { key: 'requireNumbers', label: 'Require Numbers' },
                            { key: 'requireSpecialChars', label: 'Require Special Characters' }
                          ].map((policy) => (
                            <div key={policy.key} className="flex items-center justify-between">
                              <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{policy.label}</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={securitySettings.passwordPolicy[policy.key as keyof typeof securitySettings.passwordPolicy] as boolean}
                                  onChange={(e) => setSecuritySettings(prev => ({
                                    ...prev,
                                    passwordPolicy: { ...prev.passwordPolicy, [policy.key]: e.target.checked }
                                  }))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => saveSettings('security', securitySettings)}
                        disabled={saving}
                        className="px-4 py-2 bg-SmartMess-primary text-white rounded-lg hover:bg-SmartMess-primary/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Security Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg p-6 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-6 flex items-center">
                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
                    System Configuration
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={systemSettings.siteName}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                          className="w-full px-3 py-2 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-SmartMess-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                          Site Description
                        </label>
                        <input
                          type="text"
                          value={systemSettings.siteDescription}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                          className="w-full px-3 py-2 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-SmartMess-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put the system in maintenance mode' },
                        { key: 'registrationEnabled', label: 'User Registration', description: 'Allow new user registrations' },
                        { key: 'emailVerificationRequired', label: 'Email Verification', description: 'Require email verification for new accounts' },
                        { key: 'autoBackupEnabled', label: 'Auto Backup', description: 'Enable automatic daily backups' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {setting.label}
                            </label>
                            <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                              {setting.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={systemSettings[setting.key as keyof SystemSettings] as boolean}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => saveSettings('system', systemSettings)}
                        disabled={saving}
                        className="px-4 py-2 bg-SmartMess-primary text-white rounded-lg hover:bg-SmartMess-primary/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save System Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup Settings */}
              {activeTab === 'backup' && (
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg p-6 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-6 flex items-center">
                    <ServerStackIcon className="w-5 h-5 mr-2" />
                    Backup Management
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                          Automatic Backups
                        </label>
                        <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                          Enable daily automatic backups
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoBackupEnabled}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, autoBackupEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                        Backup Retention (days)
                      </label>
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={systemSettings.backupRetentionDays}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, backupRetentionDays: parseInt(e.target.value) }))}
                        className="w-full md:w-48 px-3 py-2 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-SmartMess-primary"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/admin/system/backup', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                            });
                            if (response.ok) {
                              setSuccess('Manual backup initiated');
                              toast({
                                title: "Success",
                                description: "Manual backup initiated successfully",
                                variant: "default",
                              });
                            }
                          } catch (err) {
                            toast({
                              title: "Error",
                              description: "Failed to initiate backup",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Manual Backup
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => saveSettings('system', systemSettings)}
                        disabled={saving}
                        className="px-4 py-2 bg-SmartMess-primary text-white rounded-lg hover:bg-SmartMess-primary/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Backup Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
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

export default AdminSettings;
