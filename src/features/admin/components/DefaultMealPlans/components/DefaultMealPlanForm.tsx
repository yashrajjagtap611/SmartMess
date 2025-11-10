import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  AlertCircle, 
  Save, 
  ArrowLeft, 
  Settings,
  DollarSign,
  Loader2
} from "lucide-react";
import { LeaveRequestRules } from '../components/LeaveRequestRules';
import { useDefaultMealPlanForm } from '../DefaultMealPlans.hooks';
import { getDefaultMealPlanConfig } from '../DefaultMealPlans.utils';
import type { DefaultMealPlanFormProps } from '../DefaultMealPlans.types';

export const DefaultMealPlanForm: React.FC<DefaultMealPlanFormProps> = ({
  planId,
  onSave,
  onCancel,
}) => {
  const config = getDefaultMealPlanConfig();
  
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handlePricingChange,
    handleLeaveRuleChange,
    handleSubmit,
    handleCancel: handleCancelForm,
  } = useDefaultMealPlanForm(planId);

  const handleMealOptionsChange = (option: string, value: boolean) => {
    handleInputChange('mealOptions', {
      ...formData.mealOptions,
      [option]: value,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      return;
    }
    
    const success = await handleSubmit(e);
    if (success && onSave) {
      // Call onSave to handle UI updates (form closing, success message, etc.)
      onSave(formData);
    }
  };

  const handleFormCancel = () => {
    handleCancelForm();
    if (onCancel) {
      onCancel();
    }
  };

  if (isLoading && planId) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Loading default meal plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* Plan Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Plan Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                Enable or disable this default meal plan
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter plan name"
                className={errors['name'] ? 'border-red-500' : ''}
              />
              {errors['name'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors['name']}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealType">Meal Type *</Label>
              <Select
                value={formData.mealType}
                onValueChange={(value) => handleInputChange('mealType', value)}
              >
                <SelectTrigger className={errors['mealType'] ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {config.mealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors['mealType'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors['mealType']}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the meal plan..."
              rows={3}
              className={errors['description'] ? 'border-red-500' : ''}
            />
            {errors['description'] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors['description']}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.pricing.amount}
                onChange={(e) => handlePricingChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors['pricing'] ? 'border-red-500' : ''}
              />
              {errors['pricing'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors['pricing']}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period *</Label>
              <Select
                value={formData.pricing.period}
                onValueChange={(value) => handlePricingChange('period', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {config.pricingPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Meal Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mealsPerDay">Meals Per Day *</Label>
              <Select
                value={formData.mealsPerDay.toString()}
                onValueChange={(value) => handleInputChange('mealsPerDay', parseInt(value))}
              >
                <SelectTrigger className={errors['mealsPerDay'] ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select meals per day" />
                </SelectTrigger>
                <SelectContent>
                  {config.mealsPerDayOptions.map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} meal{count > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors['mealsPerDay'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors['mealsPerDay']}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Meal Options *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.mealOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Switch
                    id={option.value}
                    checked={formData.mealOptions[option.value as keyof typeof formData.mealOptions]}
                    onCheckedChange={(checked) => handleMealOptionsChange(option.value, checked)}
                  />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </div>
            {errors['mealOptions'] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors['mealOptions']}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Rules Card */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Rules</CardTitle>
          <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
            Configure leave request rules for this meal plan
          </p>
        </CardHeader>
        <CardContent>
          <LeaveRequestRules
            leaveRules={formData.leaveRules}
            errors={errors}
            onLeaveRuleChange={handleLeaveRuleChange}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleFormCancel}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {planId ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
};
