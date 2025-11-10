import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { creditManagementService } from '../../../../services/creditManagementService';
import { CreditSlab, CreditSlabFormData } from '../../../../types/creditManagement';

const CreditSlabsManagement: React.FC = () => {
  const [slabs, setSlabs] = useState<CreditSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<CreditSlab | null>(null);
  const [formData, setFormData] = useState<CreditSlabFormData>({
    minUsers: 1,
    maxUsers: 50,
    creditsPerUser: 6
  });
  const [formErrors, setFormErrors] = useState<Partial<CreditSlabFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlabs();
  }, []);

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const response = await creditManagementService.getCreditSlabs();
      if (response.success && response.data) {
        setSlabs(response.data);
      } else {
        setError('Failed to fetch credit slabs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit slabs');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreditSlabFormData> = {};

    if (formData.minUsers < 1) {
      errors.minUsers = 1;
    }

    if (formData.maxUsers < formData.minUsers) {
      errors.maxUsers = formData.minUsers;
    }

    if (formData.creditsPerUser < 0) {
      errors.creditsPerUser = 0;
    }

    // Check for overlapping ranges with existing slabs
    const overlappingSlab = slabs.find(slab => {
      if (editingSlab && slab._id === editingSlab._id) return false;
      return (
        (formData.minUsers <= slab.maxUsers && formData.maxUsers >= slab.minUsers) &&
        slab.isActive
      );
    });

    if (overlappingSlab) {
      setError(`Range overlaps with existing slab: ${overlappingSlab.minUsers}-${overlappingSlab.maxUsers} users`);
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      if (editingSlab) {
        const response = await creditManagementService.updateCreditSlab(editingSlab._id, formData);
        if (response.success) {
          await fetchSlabs();
          setIsDialogOpen(false);
          resetForm();
        } else {
          setError(response.message || 'Failed to update credit slab');
        }
      } else {
        const response = await creditManagementService.createCreditSlab(formData);
        if (response.success) {
          await fetchSlabs();
          setIsDialogOpen(false);
          resetForm();
        } else {
          setError(response.message || 'Failed to create credit slab');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slab: CreditSlab) => {
    setEditingSlab(slab);
    setFormData({
      minUsers: slab.minUsers,
      maxUsers: slab.maxUsers,
      creditsPerUser: slab.creditsPerUser
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (slabId: string) => {
    if (!confirm('Are you sure you want to delete this credit slab?')) return;

    try {
      const response = await creditManagementService.deleteCreditSlab(slabId);
      if (response.success) {
        await fetchSlabs();
      } else {
        setError(response.message || 'Failed to delete credit slab');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete credit slab');
    }
  };

  const handleToggleStatus = async (slabId: string, isActive: boolean) => {
    try {
      const response = await creditManagementService.updateCreditSlab(slabId, { isActive });
      if (response.success) {
        await fetchSlabs();
      } else {
        setError(response.message || 'Failed to update slab status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update slab status');
    }
  };

  const resetForm = () => {
    setFormData({
      minUsers: 1,
      maxUsers: 50,
      creditsPerUser: 6
    });
    setFormErrors({});
    setEditingSlab(null);
    setError(null);
  };

  // Calculate cumulative (tiered) credits across slabs up to a given user count
  const calculateTieredCredits = (userCount: number): number => {
    if (userCount <= 0) return 0;

    // Build a working list of slabs including the current editing/creating values
    const workingSlabs: CreditSlab[] = slabs
      .filter(s => s.isActive)
      .map(s => ({ ...s } as CreditSlab));

    if (editingSlab) {
      // Replace the editing slab with form values
      const idx = workingSlabs.findIndex(s => s._id === editingSlab._id);
      if (idx !== -1 && workingSlabs[idx]) {
        workingSlabs[idx]!.minUsers = formData.minUsers;
        workingSlabs[idx]!.maxUsers = formData.maxUsers;
        workingSlabs[idx]!.creditsPerUser = formData.creditsPerUser;
      }
    } else {
      // Include the new slab preview (temporary id)
      workingSlabs.push({
        _id: 'preview',
        minUsers: formData.minUsers,
        maxUsers: formData.maxUsers,
        creditsPerUser: formData.creditsPerUser,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: { _id: '', name: '', email: '' },
        updatedBy: { _id: '', name: '', email: '' }
      } as unknown as CreditSlab);
    }

    // Sort by minUsers asc to compute tiers in order
    workingSlabs.sort((a, b) => a.minUsers - b.minUsers);

    let total = 0;
    for (const slab of workingSlabs) {
      if (userCount < slab.minUsers) break;
      const rangeEnd = Math.min(userCount, slab.maxUsers);
      const countInRange = Math.max(0, rangeEnd - slab.minUsers + 1);
      if (countInRange > 0) {
        total += countInRange * slab.creditsPerUser;
      }
    }
    return total;
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
          <h2 className="text-2xl font-bold text-foreground">User-Based Credit Slabs</h2>
          <p className="text-muted-foreground mt-1">
            Configure credit deduction rates based on the number of users in a mess
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Credit Slab
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Credit Slabs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slabs.map((slab) => (
          <Card key={slab._id} className={`transition-all hover:shadow-md ${!slab.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">
                    {slab.minUsers}-{slab.maxUsers} Users
                  </CardTitle>
                </div>
                <Badge variant={slab.isActive ? 'default' : 'secondary'}>
                  {slab.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {slab.creditsPerUser}
                </span>
                <span className="text-muted-foreground">credits/user</span>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Created: {new Date(slab.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(slab.updatedAt).toLocaleDateString()}</p>
                {slab.updatedBy && (
                  <p>By: {slab.updatedBy.name}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(slab)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(slab._id, !slab.isActive)}
                  className="flex-1"
                >
                  {slab.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(slab._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slabs.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Credit Slabs</h3>
          <p className="text-gray-600 mb-4">
            Create your first credit slab to start managing user-based billing
          </p>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credit Slab
          </Button>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSlab ? 'Edit Credit Slab' : 'Create Credit Slab'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minUsers">Min Users</Label>
                <Input
                  id="minUsers"
                  type="number"
                  min="1"
                  value={formData.minUsers}
                  onChange={(e) => setFormData({ ...formData, minUsers: parseInt(e.target.value) || 1 })}
                  className={formErrors.minUsers ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min={formData.minUsers}
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || formData.minUsers })}
                  className={formErrors.maxUsers ? 'border-red-500' : ''}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditsPerUser">Credits per User</Label>
              <Input
                id="creditsPerUser"
                type="number"
                min="0"
                step="0.1"
                value={formData.creditsPerUser}
                onChange={(e) => setFormData({ ...formData, creditsPerUser: parseFloat(e.target.value) || 0 })}
                className={formErrors.creditsPerUser ? 'border-red-500' : ''}
                required
              />
              <p className="text-sm text-gray-500">
                Credits deducted per user in this range
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
              <p className="text-sm text-blue-800">
                For a mess with {Math.floor((formData.minUsers + formData.maxUsers) / 2)} users:
              </p>
              <p className="text-sm font-semibold text-blue-900">
                Monthly deduction: {calculateTieredCredits(Math.floor((formData.minUsers + formData.maxUsers) / 2))} credits
              </p>
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
                    {editingSlab ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    {editingSlab ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Update Slab
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Slab
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

export default CreditSlabsManagement;
