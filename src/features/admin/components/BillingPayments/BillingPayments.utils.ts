// Placeholder utilities for AdminBillingPayments
export const formatBillingAmount = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

export const getBillingStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

