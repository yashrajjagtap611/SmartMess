# SmartMess Billing & Payment System Documentation

## Overview

The SmartMess Billing & Payment System is a comprehensive solution that handles billing, subscriptions, payments, and financial management for mess owners, users, and administrators. It supports multiple payment gateways, subscription management, automated billing, and detailed reporting.

## Architecture

### Core Components

1. **Billing Models**
   - `Billing` - Individual billing records
   - `Subscription` - Subscription management
   - `Transaction` - Payment transactions
   - `PaymentGateway` - Payment gateway configurations
   - `MessMembership` - User-mess relationships with billing

2. **Services**
   - `BillingService` - Core billing operations
   - `SubscriptionService` - Subscription management
   - `PaymentGatewayService` - Payment processing
   - `BillingNotificationService` - Notification management

3. **API Endpoints**
   - `/api/billing/*` - Billing management
   - `/api/payments/*` - Payment processing
   - Admin, Mess Owner, and User specific endpoints

## Features

### 🏢 Admin Features

- **Billing Dashboard**: Comprehensive overview of all billing activities
- **Revenue Analytics**: Detailed financial reporting and analytics
- **Subscription Management**: Manage all subscriptions across the platform
- **Payment Processing**: Handle payments and refunds
- **Overdue Management**: Track and manage overdue payments
- **Bulk Operations**: Send reminders and manage multiple records

### 🏠 Mess Owner Features

- **Member Billing**: Manage billing for all mess members
- **Payment Reminders**: Send automated and manual payment reminders
- **Revenue Tracking**: Monitor mess revenue and collection rates
- **Subscription Management**: Manage member subscriptions
- **Billing Reports**: Generate detailed billing reports
- **Payment Status Updates**: Update payment statuses manually

### 👤 User Features

- **Bill Management**: View and pay bills
- **Subscription Management**: Manage personal subscriptions
- **Payment History**: View complete payment history
- **Payment Methods**: Configure payment preferences
- **Invoice Download**: Download billing invoices
- **Auto-renewal**: Set up automatic payments

## Database Schema

### Billing Model

```typescript
interface IBilling {
  userId: ObjectId;
  messId: ObjectId;
  membershipId: ObjectId;
  billingPeriod: {
    startDate: Date;
    endDate: Date;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  subscription: {
    planId: ObjectId;
    planName: string;
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  payment: {
    status: 'pending' | 'paid' | 'overdue' | 'failed' | 'cancelled' | 'refunded';
    method: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque' | 'subscription';
    dueDate: Date;
    paidDate?: Date;
    transactionId?: string;
    gatewayResponse?: any;
  };
  adjustments: Array<{
    type: 'discount' | 'penalty' | 'leave_credit' | 'late_fee' | 'refund' | 'bonus';
    amount: number;
    reason: string;
    appliedBy: ObjectId;
    appliedAt: Date;
  }>;
  leaveCredits: Array<{
    leaveId: ObjectId;
    creditAmount: number;
    applied: boolean;
    appliedAt?: Date;
  }>;
  metadata: {
    generatedBy: 'system' | 'admin' | 'mess_owner';
    notes?: string;
    tags?: string[];
  };
}
```

### Subscription Model

```typescript
interface ISubscription {
  userId: ObjectId;
  messId: ObjectId;
  membershipId: ObjectId;
  planId: ObjectId;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  pricing: {
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  paymentSettings: {
    autoRenewal: boolean;
    paymentMethod: string;
    paymentGateway?: string;
    gatewayCustomerId?: string;
    gatewaySubscriptionId?: string;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    nextBillingDate: Date;
    lastBillingDate?: Date;
    billingDay: number;
  };
  limits: {
    maxLeaveDays: number;
    maxLeaveMeals: number;
    usedLeaveDays: number;
    usedLeaveMeals: number;
  };
  features: {
    mealOptions: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
    };
    specialDietary: boolean;
    prioritySupport: boolean;
    advanceBooking: boolean;
    customTimings: boolean;
  };
  cancellation: {
    requestedAt?: Date;
    cancelledAt?: Date;
    reason?: string;
    refundAmount?: number;
    refundStatus?: 'pending' | 'processed' | 'failed';
  };
}
```

## API Endpoints

### Billing Endpoints

#### Create Billing Record
```http
POST /api/billing/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "string",
  "messId": "string",
  "membershipId": "string",
  "planId": "string",
  "billingPeriod": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "period": "monthly"
  },
  "adjustments": [
    {
      "type": "discount",
      "amount": 100,
      "reason": "Early bird discount",
      "appliedBy": "string"
    }
  ]
}
```

#### Get Billing Dashboard (Admin)
```http
GET /api/billing/dashboard
Authorization: Bearer <admin_token>
```

#### Get Mess Owner Billing Data
```http
GET /api/billing/mess-owner/:messId
Authorization: Bearer <mess_owner_token>
```

#### Get User Billing Data
```http
GET /api/billing/user
Authorization: Bearer <user_token>
```

### Subscription Endpoints

#### Create Subscription
```http
POST /api/billing/subscriptions/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "string",
  "messId": "string",
  "membershipId": "string",
  "planId": "string",
  "billingCycle": "monthly",
  "paymentSettings": {
    "autoRenewal": true,
    "paymentMethod": "upi"
  },
  "features": {
    "mealOptions": {
      "breakfast": true,
      "lunch": true,
      "dinner": true
    },
    "specialDietary": false,
    "prioritySupport": false,
    "advanceBooking": false,
    "customTimings": false
  }
}
```

#### Activate Subscription
```http
PUT /api/billing/subscriptions/:subscriptionId/activate
Authorization: Bearer <token>
```

#### Pause Subscription
```http
PUT /api/billing/subscriptions/:subscriptionId/pause
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Temporary pause requested by user"
}
```

#### Cancel Subscription
```http
PUT /api/billing/subscriptions/:subscriptionId/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "User requested cancellation",
  "refundAmount": 1500
}
```

### Payment Endpoints

#### Create Payment Order
```http
POST /api/billing/payments/create-order
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 3000,
  "currency": "INR",
  "messId": "string",
  "billingId": "string",
  "description": "Monthly mess fee",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "gatewayType": "razorpay"
}
```

#### Verify Payment
```http
POST /api/billing/payments/verify
Content-Type: application/json
Authorization: Bearer <token>

{
  "transactionId": "string",
  "paymentData": {
    "razorpay_payment_id": "pay_xxx",
    "razorpay_order_id": "order_xxx",
    "razorpay_signature": "signature_xxx"
  },
  "gatewayType": "razorpay"
}
```

#### Process Refund
```http
POST /api/billing/payments/refund
Content-Type: application/json
Authorization: Bearer <token>

{
  "transactionId": "string",
  "amount": 1500,
  "reason": "User requested refund"
}
```

## Payment Gateway Integration

### Supported Gateways

1. **Razorpay**
   - UPI, Cards, Net Banking, Wallets
   - Subscription support
   - Webhook support
   - Refund support

2. **Stripe**
   - International cards
   - Subscription support
   - Webhook support
   - Refund support

3. **PayU**
   - Indian payment methods
   - Subscription support
   - Refund support

4. **Paytm**
   - UPI, Cards, Wallets
   - Subscription support
   - Refund support

### Gateway Configuration

```typescript
interface IPaymentGateway {
  name: string;
  type: 'razorpay' | 'stripe' | 'payu' | 'paytm' | 'custom';
  isActive: boolean;
  configuration: {
    apiKey: string;
    secretKey: string;
    webhookSecret?: string;
    merchantId?: string;
    environment: 'sandbox' | 'production';
    supportedCurrencies: string[];
    supportedMethods: string[];
  };
  features: {
    supportsSubscriptions: boolean;
    supportsRefunds: boolean;
    supportsPartialRefunds: boolean;
    supportsWebhooks: boolean;
    supportsUPI: boolean;
    supportsCards: boolean;
    supportsNetBanking: boolean;
    supportsWallet: boolean;
  };
  limits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  fees: {
    processingFee: number;
    fixedFee: number;
    currency: string;
  };
}
```

## Notification System

### Notification Types

1. **Payment Due Reminder**
   - Sent 3 days before due date
   - Sent 1 day before due date
   - Sent on due date

2. **Payment Overdue**
   - Sent immediately when payment becomes overdue
   - Sent weekly for overdue payments

3. **Payment Success**
   - Sent immediately after successful payment
   - Includes transaction details

4. **Payment Failure**
   - Sent when payment fails
   - Includes failure reason

5. **Subscription Events**
   - Created, Activated, Paused, Resumed, Cancelled
   - Billing generated

6. **Refund Processed**
   - Sent when refund is processed
   - Includes refund amount and reason

### Notification Channels

- In-app notifications
- Email notifications
- SMS notifications (future)
- Push notifications (future)

## Security Features

### Data Protection

1. **Encryption**
   - Sensitive data encrypted at rest
   - Payment data encrypted in transit
   - API keys stored securely

2. **Access Control**
   - Role-based access control
   - JWT token authentication
   - API rate limiting

3. **Audit Trail**
   - All billing operations logged
   - Payment history tracked
   - User activity monitored

### Compliance

1. **PCI DSS Compliance**
   - Secure payment processing
   - No storage of sensitive card data
   - Regular security audits

2. **GDPR Compliance**
   - Data privacy controls
   - User consent management
   - Data deletion capabilities

## Testing

### Test Coverage

1. **Unit Tests**
   - Service layer tests
   - Model validation tests
   - Utility function tests

2. **Integration Tests**
   - API endpoint tests
   - Database integration tests
   - Payment gateway tests

3. **End-to-End Tests**
   - Complete billing flow tests
   - Payment processing tests
   - Notification delivery tests

### Test Script

Run the comprehensive test script:

```bash
cd backend
node scripts/testing/test-billing-system.js
```

## Deployment

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smartmess

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring & Analytics

### Key Metrics

1. **Revenue Metrics**
   - Total revenue
   - Monthly recurring revenue (MRR)
   - Average revenue per user (ARPU)
   - Collection rate

2. **Payment Metrics**
   - Payment success rate
   - Payment failure rate
   - Average transaction value
   - Refund rate

3. **Subscription Metrics**
   - Active subscriptions
   - Churn rate
   - Subscription conversion rate
   - Average subscription duration

### Monitoring Tools

1. **Application Monitoring**
   - Error tracking
   - Performance monitoring
   - Uptime monitoring

2. **Business Intelligence**
   - Revenue dashboards
   - User behavior analytics
   - Financial reporting

## Troubleshooting

### Common Issues

1. **Payment Failures**
   - Check gateway configuration
   - Verify API keys
   - Check network connectivity

2. **Billing Issues**
   - Verify user permissions
   - Check subscription status
   - Validate billing data

3. **Notification Issues**
   - Check SMTP configuration
   - Verify notification settings
   - Check user email addresses

### Support

For technical support and questions:
- Email: support@smartmess.com
- Documentation: https://docs.smartmess.com
- GitHub Issues: https://github.com/smartmess/issues

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Predictive analytics
   - Revenue forecasting
   - Customer lifetime value

2. **Mobile App Integration**
   - Mobile payment processing
   - Push notifications
   - Offline support

3. **Multi-currency Support**
   - International payments
   - Currency conversion
   - Regional pricing

4. **AI-Powered Features**
   - Smart payment reminders
   - Fraud detection
   - Automated customer support

### API Versioning

The billing system supports API versioning for backward compatibility:

- v1: Current stable version
- v2: Planned future version with enhanced features

## Conclusion

The SmartMess Billing & Payment System provides a comprehensive solution for managing financial operations in a mess management platform. With support for multiple payment gateways, automated billing, subscription management, and detailed reporting, it offers a complete financial management solution for all user types.

The system is designed to be scalable, secure, and user-friendly, with extensive testing and monitoring capabilities to ensure reliable operation in production environments.


