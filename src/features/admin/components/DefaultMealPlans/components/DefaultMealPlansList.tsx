import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Edit, 
  Trash2, 
  Play, 
  Users, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { DefaultMealPlan } from '../DefaultMealPlans.types';

interface DefaultMealPlansListProps {
  defaultMealPlans: DefaultMealPlan[];
  isLoading: boolean;
  deletingPlanId: string | null;
  generatingForMess: boolean;
  generatingForAllMesses: boolean;
  onDefaultMealPlanEdit: (plan: DefaultMealPlan) => void;
  onDefaultMealPlanDelete: (id: string) => void;
  onGenerateForMess: (messId: string) => void;
  onGenerateForAllMesses: () => void;
}

export const DefaultMealPlansList: React.FC<DefaultMealPlansListProps> = ({
  defaultMealPlans,
  isLoading,
  deletingPlanId,
  generatingForMess,
  generatingForAllMesses,
  onDefaultMealPlanEdit,
  onDefaultMealPlanDelete,
  onGenerateForMess,
  onGenerateForAllMesses,
}) => {
  const [selectedMessId, setSelectedMessId] = useState('');

  const handleGenerateForMess = async () => {
    if (!selectedMessId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Mess ID",
        variant: "destructive",
      });
      return;
    }
    await onGenerateForMess(selectedMessId);
    setSelectedMessId('');
  };

  const formatPrice = (amount: number, period: string) => {
    return `₹${amount}/${period}`;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getMealOptionsText = (mealOptions: any) => {
    const options = [];
    if (mealOptions.breakfast) options.push('Breakfast');
    if (mealOptions.lunch) options.push('Lunch');
    if (mealOptions.dinner) options.push('Dinner');
    return options.join(', ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading default meal plans...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (defaultMealPlans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Default Meal Plans</h3>
            <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mb-4">
              Create your first default meal plan to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Generate Meal Plans
          </CardTitle>
          <CardDescription>
            Generate default meal plans for existing messes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="messId">Mess ID</Label>
              <Input
                id="messId"
                placeholder="Enter Mess ID"
                value={selectedMessId}
                onChange={(e) => setSelectedMessId(e.target.value)}
              />
            </div>
            <Button
              onClick={handleGenerateForMess}
              disabled={generatingForMess || !selectedMessId.trim()}
            >
              {generatingForMess ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Generate for Mess
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            onClick={onGenerateForAllMesses}
            disabled={generatingForAllMesses}
            variant="outline"
            className="w-full"
          >
            {generatingForAllMesses ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            Generate for All Messes
          </Button>
        </CardContent>
      </Card>

      {/* Default Meal Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Default Meal Plans ({defaultMealPlans.length})</CardTitle>
          <CardDescription>
            These plans will be automatically generated for new mess owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Meals/Day</TableHead>
                <TableHead>Meal Options</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaultMealPlans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary line-clamp-2">
                        {plan.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.mealType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(plan.pricing.amount, plan.pricing.period)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.mealsPerDay}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getMealOptionsText(plan.mealOptions)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(plan.isActive)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan.createdBy ? (
                    `${plan.createdBy.firstName} ${plan.createdBy.lastName}`
                  ) : (
                    'System'
                  )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDefaultMealPlanEdit(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingPlanId === plan._id}
                          >
                            {deletingPlanId === plan._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Default Meal Plan</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                              This will only affect future mess owners - existing messes will keep their current meal plans.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDefaultMealPlanDelete(plan._id!)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
