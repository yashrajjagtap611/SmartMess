import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Gift, Settings, Mail, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { creditManagementService } from '../../../../services/creditManagementService';
import { FreeTrialSettings, FreeTrialSettingsFormData } from '../../../../types/creditManagement';

const FreeTrialSettingsManagement: React.FC = () => {
  const [, setSettings] = useState<FreeTrialSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FreeTrialSettingsFormData>({
    isGloballyEnabled: true,
    defaultTrialDurationDays: 7,
    trialCredits: 100,
    allowedFeatures: [],
    restrictedFeatures: [],
    maxTrialsPerMess: 1,
    cooldownPeriodDays: 30,
    autoActivateOnRegistration: true,
    requiresApproval: false,
    notificationSettings: {
      sendWelcomeEmail: true,
      sendReminderEmails: true,
      reminderDays: [3, 1],
      sendExpiryNotification: true
    }
  });
  const [newAllowedFeature, setNewAllowedFeature] = useState('');
  const [newRestrictedFeature, setNewRestrictedFeature] = useState('');
  const [newReminderDay, setNewReminderDay] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await creditManagementService.getFreeTrialSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        setFormData({
          isGloballyEnabled: response.data.isGloballyEnabled,
          defaultTrialDurationDays: response.data.defaultTrialDurationDays,
          trialCredits: response.data.trialCredits,
          allowedFeatures: [...response.data.allowedFeatures],
          restrictedFeatures: [...response.data.restrictedFeatures],
          maxTrialsPerMess: response.data.maxTrialsPerMess,
          cooldownPeriodDays: response.data.cooldownPeriodDays,
          autoActivateOnRegistration: response.data.autoActivateOnRegistration,
          requiresApproval: response.data.requiresApproval,
          notificationSettings: {
            sendWelcomeEmail: response.data.notificationSettings.sendWelcomeEmail,
            sendReminderEmails: response.data.notificationSettings.sendReminderEmails,
            reminderDays: [...response.data.notificationSettings.reminderDays],
            sendExpiryNotification: response.data.notificationSettings.sendExpiryNotification
          }
        });
      } else {
        setError('Failed to fetch free trial settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch free trial settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await creditManagementService.updateFreeTrialSettings(formData);
      if (response.success) {
        setSettings(response.data!);
        setSuccess('Free trial settings updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to update free trial settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const addAllowedFeature = () => {
    if (newAllowedFeature.trim() && !formData.allowedFeatures.includes(newAllowedFeature.trim())) {
      setFormData({
        ...formData,
        allowedFeatures: [...formData.allowedFeatures, newAllowedFeature.trim()]
      });
      setNewAllowedFeature('');
    }
  };

  const removeAllowedFeature = (index: number) => {
    setFormData({
      ...formData,
      allowedFeatures: formData.allowedFeatures.filter((_, i) => i !== index)
    });
  };

  const addRestrictedFeature = () => {
    if (newRestrictedFeature.trim() && !formData.restrictedFeatures.includes(newRestrictedFeature.trim())) {
      setFormData({
        ...formData,
        restrictedFeatures: [...formData.restrictedFeatures, newRestrictedFeature.trim()]
      });
      setNewRestrictedFeature('');
    }
  };

  const removeRestrictedFeature = (index: number) => {
    setFormData({
      ...formData,
      restrictedFeatures: formData.restrictedFeatures.filter((_, i) => i !== index)
    });
  };

  const addReminderDay = () => {
    const day = parseInt(newReminderDay);
    if (day > 0 && !formData.notificationSettings.reminderDays.includes(day)) {
      setFormData({
        ...formData,
        notificationSettings: {
          ...formData.notificationSettings,
          reminderDays: [...formData.notificationSettings.reminderDays, day].sort((a, b) => b - a)
        }
      });
      setNewReminderDay('');
    }
  };

  const removeReminderDay = (day: number) => {
    setFormData({
      ...formData,
      notificationSettings: {
        ...formData.notificationSettings,
        reminderDays: formData.notificationSettings.reminderDays.filter(d => d !== day)
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Free Trial Settings</h2>
          <p className="text-gray-600 mt-1">
            Configure free trial options for new mess registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.isGloballyEnabled ? 'default' : 'secondary'}>
            {formData.isGloballyEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Global Trial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Free Trials Globally</Label>
                <p className="text-sm text-gray-600">
                  Allow new messes to start free trials
                </p>
              </div>
              <Switch
                checked={formData.isGloballyEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isGloballyEnabled: checked })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trialDuration">Trial Duration (Days)</Label>
                <Input
                  id="trialDuration"
                  type="number"
                  min="1"
                  max="90"
                  value={formData.defaultTrialDurationDays}
                  onChange={(e) => setFormData({ ...formData, defaultTrialDurationDays: parseInt(e.target.value) || 7 })}
                  disabled={!formData.isGloballyEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trialCredits">Trial Credits</Label>
                <Input
                  id="trialCredits"
                  type="number"
                  min="0"
                  value={formData.trialCredits}
                  onChange={(e) => setFormData({ ...formData, trialCredits: parseInt(e.target.value) || 0 })}
                  disabled={!formData.isGloballyEnabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTrials">Max Trials per Mess</Label>
                <Input
                  id="maxTrials"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.maxTrialsPerMess}
                  onChange={(e) => setFormData({ ...formData, maxTrialsPerMess: parseInt(e.target.value) || 1 })}
                  disabled={!formData.isGloballyEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooldownPeriod">Cooldown Period (Days)</Label>
                <Input
                  id="cooldownPeriod"
                  type="number"
                  min="0"
                  value={formData.cooldownPeriodDays}
                  onChange={(e) => setFormData({ ...formData, cooldownPeriodDays: parseInt(e.target.value) || 0 })}
                  disabled={!formData.isGloballyEnabled}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-activate on Registration</Label>
                  <p className="text-sm text-gray-600">
                    Automatically start trial when mess registers
                  </p>
                </div>
                <Switch
                  checked={formData.autoActivateOnRegistration}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoActivateOnRegistration: checked })}
                  disabled={!formData.isGloballyEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Requires Admin Approval</Label>
                  <p className="text-sm text-gray-600">
                    Trial activation needs admin approval
                  </p>
                </div>
                <Switch
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
                  disabled={!formData.isGloballyEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allowed Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Allowed Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAllowedFeature}
                  onChange={(e) => setNewAllowedFeature(e.target.value)}
                  placeholder="Add allowed feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedFeature())}
                  disabled={!formData.isGloballyEnabled}
                />
                <Button 
                  type="button" 
                  onClick={addAllowedFeature} 
                  variant="outline"
                  disabled={!formData.isGloballyEnabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.allowedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm text-green-800">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllowedFeature(index)}
                      disabled={!formData.isGloballyEnabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.allowedFeatures.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No allowed features specified
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Restricted Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-600" />
                Restricted Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRestrictedFeature}
                  onChange={(e) => setNewRestrictedFeature(e.target.value)}
                  placeholder="Add restricted feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRestrictedFeature())}
                  disabled={!formData.isGloballyEnabled}
                />
                <Button 
                  type="button" 
                  onClick={addRestrictedFeature} 
                  variant="outline"
                  disabled={!formData.isGloballyEnabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.restrictedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                    <span className="text-sm text-red-800">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRestrictedFeature(index)}
                      disabled={!formData.isGloballyEnabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.restrictedFeatures.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No restricted features specified
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Send Welcome Email</Label>
                    <p className="text-sm text-gray-600">
                      Email when trial starts
                    </p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.sendWelcomeEmail}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      notificationSettings: { ...formData.notificationSettings, sendWelcomeEmail: checked }
                    })}
                    disabled={!formData.isGloballyEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Send Reminder Emails</Label>
                    <p className="text-sm text-gray-600">
                      Email reminders before expiry
                    </p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.sendReminderEmails}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      notificationSettings: { ...formData.notificationSettings, sendReminderEmails: checked }
                    })}
                    disabled={!formData.isGloballyEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Send Expiry Notification</Label>
                    <p className="text-sm text-gray-600">
                      Email when trial expires
                    </p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.sendExpiryNotification}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      notificationSettings: { ...formData.notificationSettings, sendExpiryNotification: checked }
                    })}
                    disabled={!formData.isGloballyEnabled}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Reminder Days</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Days before expiry to send reminders
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="number"
                      min="1"
                      value={newReminderDay}
                      onChange={(e) => setNewReminderDay(e.target.value)}
                      placeholder="Days before..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReminderDay())}
                      disabled={!formData.isGloballyEnabled || !formData.notificationSettings.sendReminderEmails}
                    />
                    <Button 
                      type="button" 
                      onClick={addReminderDay} 
                      variant="outline"
                      disabled={!formData.isGloballyEnabled || !formData.notificationSettings.sendReminderEmails}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.notificationSettings.reminderDays.map((day) => (
                      <Badge key={day} variant="outline" className="flex items-center gap-1">
                        {day} day{day !== 1 ? 's' : ''}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeReminderDay(day)}
                          disabled={!formData.isGloballyEnabled || !formData.notificationSettings.sendReminderEmails}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Gift className="h-5 w-5" />
              Trial Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p><strong>Duration:</strong> {formData.defaultTrialDurationDays} days</p>
            <p><strong>Credits:</strong> {creditManagementService.formatCredits(formData.trialCredits)}</p>
            <p><strong>Max Trials:</strong> {formData.maxTrialsPerMess} per mess</p>
            <p><strong>Cooldown:</strong> {formData.cooldownPeriodDays} days between trials</p>
            <p><strong>Activation:</strong> {formData.autoActivateOnRegistration ? 'Automatic' : 'Manual'}</p>
            <p><strong>Approval:</strong> {formData.requiresApproval ? 'Required' : 'Not required'}</p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FreeTrialSettingsManagement;
