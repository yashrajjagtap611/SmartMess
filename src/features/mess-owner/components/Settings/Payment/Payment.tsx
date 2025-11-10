import React from "react";
import PaymentContent from './components/PaymentContent';
import type { PaymentProps } from './Payment.types';

const Payment: React.FC<PaymentProps> = (props) => {
  return <PaymentContent {...props} />;
};

export default Payment;






