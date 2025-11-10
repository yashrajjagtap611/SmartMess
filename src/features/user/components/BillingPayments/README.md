# BillingPayments Component

A comprehensive billing and payment management component for the SmartMess application.

## Features

- **Billing Overview**: Summary cards showing monthly activity and active memberships
- **Bill Management**: View and manage individual bills with payment actions
- **Payment History**: Complete transaction history with filtering and search
- **Plan Details**: Interactive plan selection with pricing breakdown and leave credits

## Components

### Main Component
- `BillingPayments.tsx` - Main component with tabbed interface

### Sub-components
- `BillingSummary.tsx` - Overview cards and active memberships
- `BillsList.tsx` - Bill listing with actions
- `PaymentHistoryList.tsx` - Payment transaction history
- `SubscriptionsList.tsx` - Subscription management
- `PaymentDialog.tsx` - Payment processing modal
- `InvoiceManager.tsx` - Invoice and receipt management
- `BillingStats.tsx` - Analytics and statistics
- `PlanDetails.tsx` - Plan selection and pricing breakdown

### Supporting Files
- `BillingPayments.types.ts` - TypeScript interfaces
- `BillingPayments.hooks.ts` - Custom React hooks
- `BillingPayments.utils.ts` - Utility functions
- `BillingPayments.test.tsx` - Unit tests

## Usage

```tsx
import BillingPayments from '@/features/user/components/BillingPayments';

function App() {
  return (
    <div>
      <BillingPayments />
    </div>
  );
}
```

## Hooks

### useBillingPayments
Main hook for fetching and managing billing data.

```tsx
const { billingData, loading, error, refreshData } = useBillingPayments();
```

### useBillingFilters
Hook for filtering bills and payments.

```tsx
const { filteredBills, searchQuery, setSearchQuery, updateFilters } = useBillingFilters(bills);
```

### usePaymentProcessing
Hook for processing payments.

```tsx
const { processing, paymentError, processPayment } = usePaymentProcessing();
```

### useBillingStats
Hook for calculating billing statistics.

```tsx
const stats = useBillingStats(billingData);
```

## Types

### BillingRecord
```tsx
interface BillingRecord {
  id: string;
  messId: string;
  messName: string;
  membershipId: string;
  planName: string;
  billingPeriod: {
    startDate: string;
    endDate: string;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  subscription: {
    planId: string;
    planName: string;
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'overdue' | 'refunded' | 'cancelled';
    method?: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
    dueDate: string;
    paidDate?: string;
    transactionId?: string;
  };
  // ... additional fields
}
```

### PaymentHistory
```tsx
interface PaymentHistory {
  id: string;
  transactionId: string;
  messName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
  description: string;
  paymentDate: string;
  createdAt: string;
  gatewayResponse?: any;
}
```

## Utilities

### formatCurrency
Format currency amounts for display.

```tsx
formatCurrency(1500, 'INR'); // "₹1,500"
```

### formatDate
Format dates for display.

```tsx
formatDate('2024-01-15', 'short'); // "15 Jan 2024"
formatDate('2024-01-15', 'long'); // "Monday, 15 January 2024"
```

### getStatusColor
Get CSS classes for status badges.

```tsx
getStatusColor('paid'); // "text-green-600 bg-green-50 border-green-200"
```

### getStatusText
Get display text for statuses.

```tsx
getStatusText('pending'); // "Pending"
```

## Testing

Run tests with:

```bash
npm test BillingPayments
```

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Heroicons
- Radix UI components
- React Router (for navigation)

## API Integration

The component integrates with the billing service API:

- `billingService.getUserBillingData()` - Fetch user billing data
- `billingService.processPayment()` - Process payments
- `billingService.getSubscriptionPlans()` - Fetch subscription plans

## Error Handling

The component includes comprehensive error handling:

- Loading states for all async operations
- User-friendly error messages
- Retry mechanisms for failed requests

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color schemes
- Focus management

## Performance

- Lazy loading of heavy components
- Memoization of expensive calculations
- Optimized re-renders
- Efficient data filtering

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+