import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MealOptions {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export const MealOptionsTest: React.FC = () => {
  const [mealOptions, setMealOptions] = useState<MealOptions>({
    breakfast: true,
    lunch: true,
    dinner: true,
  });

  const handleMealOptionsChange = (newMealOptions: MealOptions) => {
    setMealOptions(newMealOptions);
  };

  const selectedMealsCount = [mealOptions.breakfast, mealOptions.lunch, mealOptions.dinner].filter(Boolean).length;

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Meal Options Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="SmartMess-light-text dark:SmartMess-dark-text font-semibold mb-4 block">
              Select Meal Options *
            </Label>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="breakfast"
                  checked={mealOptions.breakfast}
                  onCheckedChange={(checked) => handleMealOptionsChange({ ...mealOptions, breakfast: checked })}
                />
                <Label htmlFor="breakfast" className="SmartMess-light-text dark:SmartMess-dark-text font-medium">
                  Breakfast
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="lunch"
                  checked={mealOptions.lunch}
                  onCheckedChange={(checked) => handleMealOptionsChange({ ...mealOptions, lunch: checked })}
                />
                <Label htmlFor="lunch" className="SmartMess-light-text dark:SmartMess-dark-text font-medium">
                  Lunch
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="dinner"
                  checked={mealOptions.dinner}
                  onCheckedChange={(checked) => handleMealOptionsChange({ ...mealOptions, dinner: checked })}
                />
                <Label htmlFor="dinner" className="SmartMess-light-text dark:SmartMess-dark-text font-medium">
                  Dinner
                </Label>
              </div>
            </div>
            <div className="mt-3 text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
              Selected meals: {selectedMealsCount} meal(s) per day
            </div>
            <div className="mt-2 p-2 bg-muted rounded">
              <pre className="text-xs">
                {JSON.stringify(mealOptions, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

