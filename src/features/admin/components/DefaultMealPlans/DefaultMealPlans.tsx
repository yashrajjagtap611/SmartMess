import React, { useState } from 'react';
import { useDefaultMealPlans } from './DefaultMealPlans.hooks';
import { DefaultMealPlansList } from './';
import { DefaultMealPlanForm } from './';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { DefaultMealPlan, DefaultMealPlanFormData } from './DefaultMealPlans.types';

export const DefaultMealPlans: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DefaultMealPlan | null>(null);

  const {
    defaultMealPlans,
    isLoading,
    error,
    deletingPlanId,
    generatingForMess,
    generatingForAllMesses,
    loadDefaultMealPlans,
    deleteDefaultMealPlan,
    generateMealPlansForMess,
    generateMealPlansForAllMesses,
    clearError,
  } = useDefaultMealPlans();

  // Wrapper functions to match the form component's expected signature
  const handleFormSave = async (data: DefaultMealPlanFormData) => {
    console.log('handleFormSave called', { editingPlan: editingPlan?._id, data: { name: data.name } });
    
    // The form component handles the API call internally
    // We just need to close the form, show success message, and reload the list
    toast({
      title: "Success",
      description: editingPlan 
        ? "Default meal plan updated successfully"
        : "Default meal plan created successfully",
    });
    setShowForm(false);
    setEditingPlan(null);
    
    // Reload the meal plans list to show the new/updated plan
    await loadDefaultMealPlans();
  };

  const handleDeletePlan = async (id: string) => {
    const success = await deleteDefaultMealPlan(id);
    if (success) {
      toast({
        title: "Success",
        description: "Default meal plan deleted successfully",
      });
    }
  };

  const handleEditPlan = (plan: DefaultMealPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleGenerateForMess = async (messId: string) => {
    const success = await generateMealPlansForMess(messId);
    if (success) {
      toast({
        title: "Success",
        description: "Meal plans generated for mess successfully",
      });
    }
  };

  const handleGenerateForAllMesses = async () => {
    const success = await generateMealPlansForAllMesses();
    if (success) {
      toast({
        title: "Success",
        description: "Meal plans generated for all messes successfully",
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleRefresh = async () => {
    await loadDefaultMealPlans();
    toast({
      title: "Refreshed",
      description: "Default meal plans list updated",
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={clearError}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Default Meal Plans</h1>
          <p className="text-muted-foreground">
            Manage default meal plans that will be automatically generated for new mess owners
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Default Plan
          </Button>
        </div>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPlan ? 'Edit Default Meal Plan' : 'Create Default Meal Plan'}
            </CardTitle>
            <CardDescription>
              {editingPlan 
                ? 'Update the default meal plan settings'
                : 'Create a new default meal plan that will be used for new mess owners'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editingPlan?._id ? (
              <DefaultMealPlanForm
                planId={editingPlan._id}
                onSave={handleFormSave}
                onCancel={handleCancelForm}
              />
            ) : (
              <DefaultMealPlanForm
                onSave={handleFormSave}
                onCancel={handleCancelForm}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <DefaultMealPlansList
          defaultMealPlans={defaultMealPlans}
          isLoading={isLoading}
          deletingPlanId={deletingPlanId}
          generatingForMess={generatingForMess}
          generatingForAllMesses={generatingForAllMesses}
          onDefaultMealPlanEdit={handleEditPlan}
          onDefaultMealPlanDelete={handleDeletePlan}
          onGenerateForMess={handleGenerateForMess}
          onGenerateForAllMesses={handleGenerateForAllMesses}
        />
      )}
    </div>
  );
};
