
import { CreditCardIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import type { PaymentSettings } from '@/services/api/messService';

interface PaymentFormProps {
  paymentSettings: PaymentSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  onSettingChange: (field: keyof PaymentSettings, value: string | boolean | number) => void;
  onSave: () => Promise<void>;
}

export default function PaymentForm({
  paymentSettings,
  loading,
  saving,
  error,
  success,
  onSettingChange,
  onSave,
}: PaymentFormProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text mb-2">Payment Settings</h2>
        <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Configure payment methods and billing preferences</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-2">Loading payment settings...</p>
        </div>
      ) : (
        <>
          {/* Payment Methods Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Details */}
            <div className="space-y-4">
              {/* Cash Payment Switch */}
              <div className="flex items-center justify-between p-4 rounded-lg SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border mb-2">
                <div>
                  <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Cash Payment</h4>
                  <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Enable cash payment option</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary">
                  <input
                    type="checkbox"
                    checked={paymentSettings.isCashPayment}
                    onChange={e => onSettingChange("isCashPayment", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:SmartMess-light-primary dark:SmartMess-dark-primary"></div>
                </label>
              </div>
              {/* UPI and Bank fields - always enabled */}
              <div>
                <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="your-upi@bank"
                  value={paymentSettings.upiId}
                  onChange={e => onSettingChange("upiId", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  Bank Account
                </label>
                <input
                  type="text"
                  placeholder="Account number"
                  value={paymentSettings.bankAccount}
                  onChange={e => onSettingChange("bankAccount", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Payment Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-brand-primary/10">
                  <CurrencyRupeeIcon className="h-5 w-5 text-brand-primary" />
                </div>
                <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Payment Settings</h3>
              </div>
              
              {/* Auto Payment Switch - always enabled */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                <div>
                  <h4 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Auto Payment</h4>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Automatic payment processing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary">
                  <input
                    type="checkbox"
                    checked={paymentSettings.autoPayment}
                    onChange={e => onSettingChange("autoPayment", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-SmartMess-light-border dark:SmartMess-dark-border dark:bg-SmartMess-light-border dark:SmartMess-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
              
              {/* Late Fee Switch - always enabled */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                <div>
                  <h4 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Late Fee</h4>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Charge late payment fees</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary">
                  <input
                    type="checkbox"
                    checked={paymentSettings.lateFee}
                    onChange={e => onSettingChange("lateFee", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-SmartMess-light-border dark:SmartMess-dark-border dark:bg-SmartMess-light-border dark:SmartMess-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
              
              {/* Late Fee Amount - only show if lateFee is true */}
              {paymentSettings.lateFee && (
                <div>
                  <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                    Late Fee Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentSettings.lateFeeAmount}
                    onChange={e => onSettingChange("lateFeeAmount", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Payment Options */}
          <div className="rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-primary/10">
                <CreditCardIcon className="h-5 w-5 text-brand-primary" />
              </div>
              <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Additional Payment Options</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-5 bg-blue-600 rounded"></div>
                  <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Credit Card</span>
                </div>
                <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Accept credit card payments</p>
              </div>
              
              <div className="p-4 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-5 bg-green-600 rounded"></div>
                  <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Debit Card</span>
                </div>
                <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Accept debit card payments</p>
              </div>
              
              <div className="p-4 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-5 bg-purple-600 rounded"></div>
                  <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Digital Wallets</span>
                </div>
                <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Paytm, PhonePe, etc.</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              type="button"
              onClick={onSave}
              disabled={loading || saving}
              className="px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}






