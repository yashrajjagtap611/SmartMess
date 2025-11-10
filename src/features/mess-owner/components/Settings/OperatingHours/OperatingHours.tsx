import React from "react";
import OperatingHoursContent from './components/OperatingHoursContent';
import type { OperatingHoursProps } from './OperatingHours.types';

const OperatingHours: React.FC<OperatingHoursProps> = (props) => {
  return <OperatingHoursContent {...props} />;
};

export default OperatingHours;






