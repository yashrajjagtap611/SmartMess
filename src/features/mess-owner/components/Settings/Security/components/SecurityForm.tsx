
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface SecurityFormProps {
  profileVisible: boolean;
  contactVisible: boolean;
  ratingsVisible: boolean;
  currentPassword: string;
  newPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  loading?: boolean;
  saving?: boolean;
  error?: string | null;
  success?: string | null;
  onProfileVisibleChange: (value: boolean) => void;
  onContactVisibleChange: (value: boolean) => void;
  onRatingsVisibleChange: (value: boolean) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onShowCurrentPasswordChange: (value: boolean) => void;
  onShowNewPasswordChange: (value: boolean) => void;
  onUpdatePassword: () => void;
  onUpdatePrivacy: () => void;
}

export default function SecurityForm({
  profileVisible,
  contactVisible,
  ratingsVisible,
  currentPassword,
  newPassword,
  showCurrentPassword,
  showNewPassword,
  saving = false,
  error = null,
  success = null,
  onProfileVisibleChange,
  onContactVisibleChange,
  onRatingsVisibleChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onShowCurrentPasswordChange,
  onShowNewPasswordChange,
  onUpdatePassword,
  onUpdatePrivacy,
}: SecurityFormProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text mb-2">Security Settings</h2>
        <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Manage your account security and privacy settings</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
          {success}
        </div>
      )}

      {/* Profile Visibility Section */}
      <div className="rounded-lg border SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-surface dark:SmartMess-dark-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg SmartMess-light-primary dark:SmartMess-dark-primary/10">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Profile Visibility</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Profile Visible</h4>
              <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Allow users to view your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary">
              <input
                type="checkbox"
                checked={profileVisible}
                onChange={(e) => onProfileVisibleChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:SmartMess-light-primary dark:SmartMess-dark-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
            <div>
              <h4 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Contact Visible</h4>
              <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Show contact information to users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <input
                type="checkbox"
                checked={contactVisible}
                onChange={(e) => onContactVisibleChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-SmartMess-light-border dark:SmartMess-dark-border dark:bg-SmartMess-light-border dark:SmartMess-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
            <div>
              <h4 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Ratings Visible</h4>
              <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Display ratings and reviews publicly</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <input
                type="checkbox"
                checked={ratingsVisible}
                onChange={(e) => onRatingsVisibleChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-SmartMess-light-border dark:SmartMess-dark-border dark:bg-SmartMess-light-border dark:SmartMess-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-brand-primary/10">
            <ShieldCheckIcon className="h-5 w-5 text-brand-primary" />
          </div>
          <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Change Password</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => onCurrentPasswordChange(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => onShowCurrentPasswordChange(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text"
                >
                  {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => onNewPasswordChange(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => onShowNewPasswordChange(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text"
                >
                  {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={onUpdatePassword}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-red-500"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={onUpdatePrivacy}
          disabled={saving}
          className="px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}






