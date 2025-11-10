import React from "react";
import { Routes, Route } from "react-router-dom";
import { MealPlanForm } from './components/MealPlanForm';
import { MessPlans } from './components/MessPlans';
import type { MealPlanProps } from './MealPlan.types';

const MealPlan: React.FC<MealPlanProps> = (props) => {
  return (
    <Routes>
      <Route path="/" element={<MessPlans {...props} />} />
      <Route path="/new" element={<MealPlanForm />} />
      <Route path="/edit/:planId" element={<MealPlanForm />} />
    </Routes>
  );
};

export default MealPlan;









