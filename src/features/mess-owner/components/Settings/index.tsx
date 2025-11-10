import { Routes, Route } from "react-router-dom";
import MealPlan from "./MealPlan";
import MessProfile from "./MessProfile";
import OperatingHours from "./OperatingHours/components/OperatingHoursContent";
import Payment from "./Payment/components/PaymentContent";
import Security from "./Security/components/SecurityContent";

export default function Settings() {
  return (
    <Routes>
      <Route path="/mess-plans/*" element={<MealPlan />} />
      <Route path="/mess-profile" element={<MessProfile />} />
      <Route path="/operating-hours" element={<OperatingHours />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/security" element={<Security />} />
      {/* Add other settings routes here as needed */}
    </Routes>
  );
} 