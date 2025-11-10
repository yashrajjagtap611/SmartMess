import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from "@/components/theme/theme-provider";
import { handleLogout as logoutUtil } from "@/utils/logout";
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
  Info, 
  Save, 
  ArrowLeft, 
  Settings,
  DollarSign
} from "lucide-react";
import { LeaveRequestRules } from './LeaveRequestRules';
import { useMealPlanForm } from '../MealPlan.hooks';
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { useUser } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { getMealPlanConfig, getSelectedMealsText } from '../MealPlan.utils';


export const MealPlanForm: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { planId } = useParams<{ planId: string }>();
  const config = getMealPlanConfig();
  
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handlePricingChange,
    handleLeaveRuleChange,
    handleMealOptionsChange,
    handleSubmit,
    handleCancel,
  } = useMealPlanForm(planId);

  const { user } = useUser();

  const handleLogout = useCallback(() => {
    logoutUtil(window.location.href);
  }, []);

  if (isLoading && planId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        <div className="lg:ml-90 transition-all duration-300">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary text-lg font-medium">
                Loading meal plan details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />

      <div className="lg:ml-90 transition-all duration-300">
        {user ? (
          <CommonHeader
            title={planId ? 'Edit Meal Plan' : 'Create Meal Plan'}
            subtitle={planId ? 'Update your meal plan details' : 'Add a new meal plan for your mess'}
            variant="default"
            showUserProfile={true}
            user={{
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              ...(user.profilePicture ? { avatar: user.profilePicture } : {}),
              email: user.email
            }}
            onUserProfileClick={() => window.location.href = ROUTES.MESS_OWNER.PROFILE}
          />
        ) : (
          <CommonHeader
            title={planId ? 'Edit Meal Plan' : 'Create Meal Plan'}
            subtitle={planId ? 'Update your meal plan details' : 'Add a new meal plan for your mess'}
            variant="default"
            showUserProfile={true}
            onUserProfileClick={() => window.location.href = ROUTES.MESS_OWNER.PROFILE}
          />
        )}

        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto pb-20 lg:pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Plan Status Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 SmartMess-light-primary dark:SmartMess-dark-primary/20 rounded-xl">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Plan Status</h3>
                      <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                        Enable this plan for customers to subscribe
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                    />
                    <Label htmlFor="isActive" className="text-sm font-medium">
                      {formData.isActive ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information Card */}
            <Card className="SmartMess-light-border dark:SmartMess-dark-border shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b SmartMess-light-border dark:SmartMess-dark-border">
                <CardTitle className="flex items-center gap-3 SmartMess-light-text dark:SmartMess-dark-text">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Basic Information
                </CardTitle>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                  Set up the fundamental details of your meal plan
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="SmartMess-light-text dark:SmartMess-dark-text font-semibold">
                      Plan Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Standard Plan, Premium Vegetarian"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 ${
                        errors['name']
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-input focus:border-primary focus:ring-primary/20"
                      } SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text placeholder:SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary focus:outline-none focus:ring-4`}
                    />
                    {errors['name'] && (
                      <p className="text-sm text-destructive font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors['name']}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="mealType" className="SmartMess-light-text dark:SmartMess-dark-text font-semibold">
                      Meal Type *
                    </Label>
                    <Select value={formData.mealType} onValueChange={(value) => handleInputChange("mealType", value)}>
                      <SelectTrigger className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 ${
                        errors['mealType']
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-input focus:border-primary focus:ring-primary/20"
                      } SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4`}>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent className="SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-border rounded-xl shadow-xl">
                        {config.mealTypes.map((type) => (
                          <SelectItem key={type} value={type} className="SmartMess-light-text dark:SmartMess-dark-text SmartMess-light-hover dark:SmartMess-dark-hover focus:SmartMess-light-accent dark:SmartMess-dark-accent">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['mealType'] && (
                      <p className="text-sm text-destructive font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors['mealType']}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="SmartMess-light-text dark:SmartMess-dark-text font-semibold">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your meal plan, including what customers can expect..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      errors['description']
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-input focus:border-primary focus:ring-primary/20"
                    } SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text placeholder:SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary focus:outline-none focus:ring-4 resize-none`}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                      {formData.description.length}/500 characters
                    </div>
                    {errors['description'] && (
                      <p className="text-sm text-destructive font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors['description']}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Meals Card */}
            <Card className="SmartMess-light-border dark:SmartMess-dark-border shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-b SmartMess-light-border dark:SmartMess-dark-border">
                <CardTitle className="flex items-center gap-3 SmartMess-light-text dark:SmartMess-dark-text">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Pricing & Meals
                </CardTitle>
                <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                  Configure pricing structure and meal frequency
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="pricing" className="SmartMess-light-text dark:SmartMess-dark-text font-semibold">
                      Price Amount *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary font-medium">₹</span>
                      <Input
                        id="pricing"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.pricing.amount}
                        onChange={(e) => handlePricingChange("amount", parseFloat(e.target.value) || 0)}
                        className={`h-12 pl-8 pr-4 rounded-xl border-2 transition-all duration-200 ${
                          errors['pricing']
                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                            : "border-input focus:border-primary focus:ring-primary/20"
                        } SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text placeholder:SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary focus:outline-none focus:ring-4`}
                      />
                    </div>
                    {errors['pricing'] && (
                      <p className="text-sm text-destructive font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors['pricing']}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="pricingPeriod" className="SmartMess-light-text dark:SmartMess-dark-text font-semibold">
                      Billing Period
                    </Label>
                    <Select value={formData.pricing.period} onValueChange={(value: "day" | "month" | "year") => handlePricingChange("period", value)}>
                      <SelectTrigger className="h-12 px-4 rounded-xl border-2 border-input focus:border-primary focus:ring-primary/20 SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="SmartMess-light-bg dark:SmartMess-dark-bg border SmartMess-light-border dark:SmartMess-dark-border rounded-xl shadow-xl">
                        {config.pricingPeriods.map((period) => (
                          <SelectItem key={period.value} value={period.value} className="SmartMess-light-text dark:SmartMess-dark-text SmartMess-light-hover dark:SmartMess-dark-hover focus:SmartMess-light-accent dark:SmartMess-dark-accent">
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="mealsPerDay" className="SmartMess-light-text dark:SmartMess-dark-text font-semibold">
                      Meals per Day (Auto-calculated)
                    </Label>
                    <div className="h-12 px-4 rounded-xl border-2 border-muted bg-muted/50 flex items-center justify-center">
                      <span className="SmartMess-light-text dark:SmartMess-dark-text font-semibold text-lg">
                        {getSelectedMealsText(formData.mealOptions)}
                      </span>
                    </div>
                    <div className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                      This is automatically calculated based on your meal selections below
                    </div>
                  </div>
                </div>

                {/* Meal Options Selection */}
                <div className="mt-6 pt-6 border-t SmartMess-light-border dark:SmartMess-dark-border">
                  <Label className="SmartMess-light-text dark:SmartMess-dark-text font-semibold mb-4 block">
                    Select Meal Options *
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="breakfast"
                        checked={formData.mealOptions.breakfast}
                        onCheckedChange={(checked) => handleMealOptionsChange({ ...formData.mealOptions, breakfast: checked })}
                      />
                      <Label htmlFor="breakfast" className="SmartMess-light-text dark:SmartMess-dark-text font-medium">
                        Breakfast
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="lunch"
                        checked={formData.mealOptions.lunch}
                        onCheckedChange={(checked) => handleMealOptionsChange({ ...formData.mealOptions, lunch: checked })}
                      />
                      <Label htmlFor="lunch" className="SmartMess-light-text dark:SmartMess-dark-text font-medium">
                        Lunch
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="dinner"
                        checked={formData.mealOptions.dinner}
                        onCheckedChange={(checked) => handleMealOptionsChange({ ...formData.mealOptions, dinner: checked })}
                      />
                      <Label htmlFor="dinner" className="SmartMess-light-text dark:SmartMess-dark-text font-medium">
                        Dinner
                      </Label>
                    </div>
                  </div>
                  {errors['mealOptions'] && (
                    <p className="text-sm text-destructive font-medium flex items-center gap-1 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors['mealOptions']}
                    </p>
                  )}
                  <div className="mt-3 text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                    Selected meals: {getSelectedMealsText(formData.mealOptions)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Request Rules */}
            <LeaveRequestRules
              leaveRules={formData.leaveRules}
              errors={errors}
              onLeaveRuleChange={handleLeaveRuleChange}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t SmartMess-light-border dark:SmartMess-dark-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                disabled={isLoading} 
                className="h-12 px-8 rounded-xl border-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="h-12 px-8 rounded-xl SmartMess-light-primary dark:SmartMess-dark-primary hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {planId ? "Update Plan" : "Create Plan"}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:hidden">
          <BottomNavigation
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};









