import React from "react";
import SecurityContent from './components/SecurityContent';
import type { SecurityProps } from './Security.types';

const Security: React.FC<SecurityProps> = (props) => {
  return <SecurityContent {...props} />;
};

export default Security;






