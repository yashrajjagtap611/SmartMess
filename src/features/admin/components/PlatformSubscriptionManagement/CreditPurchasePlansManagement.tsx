import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CreditCard, Star, Gift, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { creditManagementService } from '../../../../services/creditManagementService';
import { CreditPurchasePlan, CreditPurchasePlanFormData } from '../../../../types/creditManagement';

const CreditPurchasePlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<CreditPurchasePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CreditPurchasePlan | null>(null);
  const [formData, setFormData] = useState<CreditPurchasePlanFormData>({
    name: '',
    description: '',
    baseCredits: 100,
    bonusCredits: 0,
    price: 100,
    currency: 'INR',
    isPopular: false,
    features: []
  });
  const [newFeature, setNewFeature] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await creditManagementService.getCreditPurchasePlans();
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        setError('Failed to fetch credit purchase plans');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit purchase plans');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Plan name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Plan description is required');
      return false;
    }
    if (formData.baseCredits < 1) {
      setError('Base credits must be at least 1');
      return false;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      if (editingPlan) {
        const response = await creditManagementService.updateCreditPurchasePlan(editingPlan._id, formData);
        if (response.success) {
          await fetchPlans();
          setIsDialogOpen(false);
          resetForm();
        } else {
          setError(response.message || 'Failed to update credit purchase plan');
        }
      } else {
        const response = await creditManagementService.createCreditPurchasePlan(formData);
        if (response.success) {
          await fetchPlans();
          setIsDialogOpen(false);
          resetForm();
        } else {
          setError(response.message || 'Failed to create credit purchase plan');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan: CreditPurchasePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      baseCredits: plan.baseCredits,
      bonusCredits: plan.bonusCredits,
      price: plan.price,
      currency: plan.currency as 'INR' | 'USD' | 'EUR',
      isPopular: plan.isPopular,
      features: [...plan.features],
      validityDays: plan.validityDays
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this credit purchase plan?')) return;

    try {
      const response = await creditManagementService.deleteCreditPurchasePlan(planId);
      if (response.success) {
        await fetchPlans();
      } else {
        setError(response.message || 'Failed to delete credit purchase plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete credit purchase plan');
    }
  };

  const handleToggleStatus = async (planId: string, isActive: boolean) => {
    try {
      const response = await creditManagementService.updateCreditPurchasePlan(planId, { isActive });
      if (response.success) {
        await fetchPlans();
      } else {
        setError(response.message || 'Failed to update plan status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan status');
    }
  };

  const handleTogglePopular = async (planId: string, isPopular: boolean) => {
    try {
      const response = await creditManagementService.updateCreditPurchasePlan(planId, { isPopular });
      if (response.success) {
        await fetchPlans();
      } else {
        setError(response.message || 'Failed to update popular status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update popular status');
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      baseCredits: 100,
      bonusCredits: 0,
      price: 100,
      currency: 'INR',
      isPopular: false,
      features: []
    });
    setNewFeature('');
    setEditingPlan(null);
    setError(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
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
          <h2 className="text-2xl font-bold text-gray-900">Credit Purchase Plans</h2>
          <p className="text-gray-600 mt-1">
            Manage credit packages that mess owners can purchase
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Credit Plan
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Credit Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan._id} className={`transition-all hover:shadow-lg ${!plan.isActive ? 'opacity-60' : ''} ${plan.isPopular ? 'ring-2 ring-yellow-400' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {plan.name}
                    {plan.isPopular && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                </div>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price and Credits */}
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {creditManagementService.formatCurrency(plan.price, plan.currency)}
                </div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {creditManagementService.formatCredits(plan.baseCredits)} Credits
                </div>
                {plan.bonusCredits > 0 && (
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600 mt-1">
                    <Gift className="h-4 w-4" />
                    +{creditManagementService.formatCredits(plan.bonusCredits)} Bonus
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  Total: {creditManagementService.formatCredits(plan.totalCredits)} Credits
                </div>
              </div>

              {/* Features */}
              {plan.features.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-sm text-gray-500">
                        +{plan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Validity */}
              {plan.validityDays && (
                <div className="text-sm text-gray-600">
                  <strong>Validity:</strong> {plan.validityDays} days
                </div>
              )}

              {/* Meta Info */}
              <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                <p>Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(plan.updatedAt).toLocaleDateString()}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePopular(plan._id, !plan.isPopular)}
                  className={plan.isPopular ? 'text-yellow-600' : ''}
                >
                  <Star className={`h-4 w-4 ${plan.isPopular ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(plan._id, !plan.isActive)}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(plan._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card className="p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Credit Plans</h3>
          <p className="text-gray-600 mb-4">
            Create your first credit purchase plan to start selling credits
          </p>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credit Plan
          </Button>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Credit Plan' : 'Create Credit Plan'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Starter Pack"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value: 'INR' | 'USD' | 'EUR') => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this plan offers..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseCredits">Base Credits</Label>
                <Input
                  id="baseCredits"
                  type="number"
                  min="1"
                  value={formData.baseCredits}
                  onChange={(e) => setFormData({ ...formData, baseCredits: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonusCredits">Bonus Credits</Label>
                <Input
                  id="bonusCredits"
                  type="number"
                  min="0"
                  value={formData.bonusCredits}
                  onChange={(e) => setFormData({ ...formData, bonusCredits: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validityDays">Validity (Days) - Optional</Label>
              <Input
                id="validityDays"
                type="number"
                min="1"
                value={formData.validityDays || ''}
                onChange={(e) => setFormData({ ...formData, validityDays: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Leave empty for no expiry"
              />
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  Add
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
              />
              <Label htmlFor="isPopular">Mark as Popular Plan</Label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Plan Preview</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Total Credits:</strong> {formData.baseCredits + formData.bonusCredits}</p>
                <p><strong>Price per Credit:</strong> {creditManagementService.formatCurrency(formData.price / (formData.baseCredits + formData.bonusCredits), formData.currency)}</p>
                {formData.bonusCredits > 0 && (
                  <p><strong>Bonus Value:</strong> {((formData.bonusCredits / (formData.baseCredits + formData.bonusCredits)) * 100).toFixed(1)}% extra credits</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingPlan ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    {editingPlan ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Update Plan
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Plan
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditPurchasePlansManagement;
