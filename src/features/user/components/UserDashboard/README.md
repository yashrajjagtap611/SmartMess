# UserDashboard - Restructured Components

## Overview
The UserDashboard has been restructured with modular components to improve maintainability, reusability, and user experience. The new structure includes enhanced payment functionality with UPI support.

## Component Structure

### Main Components

#### 1. UserDashboard.tsx
- **Purpose**: Main dashboard component that orchestrates all sub-components
- **Features**: 
  - Tab-based navigation (Our Mess / Find a Mess)
  - Responsive layout with sidebar and bottom navigation
  - Integration with all sub-components

#### 2. PaymentModal.tsx
- **Purpose**: Comprehensive payment modal with multiple payment methods
- **Features**:
  - UPI payment with QR code generation
  - Online banking integration
  - Cash payment option
  - Payment processing states (select, processing, success, error)
  - Real-time UPI QR code display
  - Payment method validation

#### 3. MessMembershipCard.tsx
- **Purpose**: Displays individual mess membership information
- **Features**:
  - Status indicators (active, pending, suspended)
  - Payment status tracking
  - Meal plan details
  - Action buttons (pay bill, leave plan)
  - Responsive design with proper spacing

#### 4. StatsCard.tsx
- **Purpose**: Displays dashboard statistics
- **Features**:
  - Icon-based statistics display
  - Hover animations
  - Color-coded status indicators
  - Responsive grid layout

#### 5. ActivityItem.tsx
- **Purpose**: Shows recent activity items
- **Features**:
  - Status-based icons and colors
  - Timestamp formatting
  - Hover effects
  - Border-left status indicators

#### 6. QuickActions.tsx
- **Purpose**: Provides quick access to common actions
- **Features**:
  - Payment alerts (pending/overdue)
  - Action buttons with icons
  - Color-coded action categories
  - Responsive grid layout

#### 7. LeaveConfirmationModal.tsx
- **Purpose**: Confirms meal plan leave requests
- **Features**:
  - Clear warning messages
  - Action confirmation
  - Loading states
  - Responsive design

## Payment Integration

### UPI Payment Flow
1. **Payment Initiation**: User clicks "Pay Bill" on pending payments
2. **Payment Modal**: Opens with payment method selection
3. **UPI QR Code**: Generated automatically if UPI ID is available
4. **Payment Processing**: Simulated payment processing with loading states
5. **Success/Error Handling**: Clear feedback to user

### Backend Integration
- **Payment Settings**: Mess owners can configure UPI IDs
- **Payment Processing**: Backend handles payment method validation
- **Status Updates**: Real-time payment status updates
- **Notification System**: Payment confirmations and alerts

## File Structure
```
UserDashboard/
├── components/
│   ├── PaymentModal.tsx
│   ├── MessMembershipCard.tsx
│   ├── StatsCard.tsx
│   ├── ActivityItem.tsx
│   ├── QuickActions.tsx
│   ├── LeaveConfirmationModal.tsx
│   └── index.ts
├── UserDashboard.tsx
├── UserDashboard.hooks.ts
├── UserDashboard.types.ts
├── UserDashboard.utils.ts
├── index.ts
└── README.md
```

## Key Features

### Enhanced Payment System
- **Multiple Payment Methods**: UPI, Online Banking, Cash
- **UPI QR Code Generation**: Automatic QR code creation for UPI payments
- **Payment Status Tracking**: Real-time status updates
- **Error Handling**: Comprehensive error handling and user feedback

### Improved User Experience
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Loading States**: Clear loading indicators for all async operations
- **Toast Notifications**: User-friendly feedback messages
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Modular Architecture
- **Component Reusability**: Components can be used across different features
- **Type Safety**: Full TypeScript integration with proper interfaces
- **State Management**: Centralized state management with custom hooks
- **Error Boundaries**: Proper error handling and fallbacks

## Usage Examples

### Basic Usage
```tsx
import UserDashboard from '@/features/user/components/UserDashboard';

function App() {
  return <UserDashboard />;
}
```

### Custom Payment Modal
```tsx
import { PaymentModal } from '@/features/user/components/UserDashboard/components';

<PaymentModal
  isOpen={isPaymentModalOpen}
  onClose={() => setIsPaymentModalOpen(false)}
  billId="bill-123"
  amount={5000}
  messName="Sample Mess"
  upiId="messowner@upi"
  onPaymentSuccess={(method) => console.log(`Payment via ${method} successful`)}
  loading={false}
/>
```

## Backend Requirements

### Payment Settings Model
```typescript
interface PaymentSettings {
  userId: string;
  upiId: string;
  bankAccount: string;
  autoPayment: boolean;
  lateFee: boolean;
  lateFeeAmount: number;
  isCashPayment: boolean;
}
```

### API Endpoints
- `GET /api/mess/details/:messId` - Get mess details with UPI information
- `POST /api/mess/pay-bill` - Process bill payments
- `GET /api/payment-settings` - Get payment settings
- `POST /api/payment-settings` - Update payment settings

## Future Enhancements

### Planned Features
1. **Real Payment Gateway Integration**: Connect with actual payment gateways
2. **Payment History**: Detailed payment transaction history
3. **Auto-Payment**: Scheduled automatic payments
4. **Payment Analytics**: Payment trends and insights
5. **Multi-Currency Support**: Support for different currencies

### Technical Improvements
1. **Performance Optimization**: Lazy loading and code splitting
2. **Caching Strategy**: Implement proper caching for payment data
3. **Offline Support**: Handle offline payment scenarios
4. **Push Notifications**: Real-time payment notifications

## Contributing

When contributing to the UserDashboard:

1. **Follow Component Structure**: Use the established component hierarchy
2. **Type Safety**: Always use TypeScript interfaces
3. **Testing**: Add unit tests for new components
4. **Documentation**: Update this README for new features
5. **Accessibility**: Ensure components are accessible
6. **Mobile First**: Design for mobile devices first

## Dependencies

### Required Packages
- `@heroicons/react` - Icons
- `qrcode.react` - QR code generation
- `@/hooks/use-toast` - Toast notifications
- `@/services/api/messService` - API integration

### Optional Packages
- `react-query` - Data fetching and caching
- `framer-motion` - Advanced animations
- `react-hook-form` - Form handling
