# Razorpay Payment Integration for Credit Purchase

This document explains the Razorpay payment gateway integration for purchasing credits in the SmartMess platform.

## Overview

The platform now supports purchasing credits through Razorpay payment gateway. Mess owners can buy credit packages to continue using the platform services.

## Features

✅ Secure payment processing with Razorpay
✅ Multiple credit purchase plans
✅ Automatic credit addition upon successful payment
✅ Payment history tracking
✅ Transaction verification with signature validation
✅ Webhook support for automatic payment confirmation
✅ Comprehensive error handling

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate API Keys (Key ID and Key Secret)
4. For webhooks, go to Settings → Webhooks and create a webhook secret

### 2. Configure Environment Variables

Add the following to your `.env` file in the backend:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### 3. Test Mode vs Live Mode

- **Test Mode**: Use test API keys for development/testing
- **Live Mode**: Use live API keys for production

Razorpay provides test cards for testing:
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

## Architecture

### Backend Components

#### 1. **Configuration** (`backend/src/config/razorpay.ts`)
- Initializes Razorpay instance
- Validates configuration
- Exports configuration constants

#### 2. **Model** (`backend/src/models/PaymentTransaction.ts`)
- Stores payment transaction records
- Tracks payment status and details
- Links to mess, user, and credit plan

#### 3. **Service** (`backend/src/services/razorpayService.ts`)
- `createOrder()`: Creates Razorpay order
- `verifyPaymentSignature()`: Validates payment signature
- `handlePaymentSuccess()`: Processes successful payments and credits account
- `handlePaymentFailure()`: Handles failed payments
- `getPaymentHistory()`: Retrieves payment history

#### 4. **Controller** (`backend/src/controllers/paymentController.ts`)
- `createOrder()`: API endpoint to create payment order
- `verifyPayment()`: Verifies and processes payment
- `getTransactionDetails()`: Fetches transaction details
- `getPaymentHistory()`: Gets payment history
- `handleWebhook()`: Processes Razorpay webhooks

#### 5. **Routes** (`backend/src/routes/payment.ts`)
- `GET /api/razorpay/config`: Get Razorpay public configuration
- `POST /api/razorpay/create-order`: Create payment order
- `POST /api/razorpay/verify`: Verify payment
- `GET /api/razorpay/transaction/:orderId`: Get transaction details
- `GET /api/razorpay/history`: Get payment history
- `POST /api/razorpay/webhook`: Webhook endpoint

### Frontend Components

#### 1. **Service** (`src/services/paymentService.ts`)
- Loads Razorpay checkout script
- Creates payment orders
- Initializes Razorpay modal
- Verifies payments
- Handles payment callbacks

#### 2. **Component** (`src/features/mess-owner/components/PlatformSubscription/MessOwnerSubscription.tsx`)
- Displays credit purchase plans
- Initiates payment process
- Shows payment status
- Displays transaction history

## Payment Flow

### 1. **Order Creation**
```
User clicks "Purchase Now" 
  → Frontend calls createOrder API
    → Backend creates Razorpay order
      → Backend stores transaction record
        → Returns order details to frontend
```

### 2. **Payment Processing**
```
Frontend receives order details
  → Loads Razorpay checkout script
    → Opens Razorpay payment modal
      → User completes payment
        → Razorpay processes payment
          → Payment success/failure callback
```

### 3. **Payment Verification**
```
Frontend receives payment response
  → Calls verifyPayment API with signature
    → Backend verifies Razorpay signature
      → If valid, credits mess account
        → Creates credit transaction
          → Returns success response
            → Frontend shows success message
              → Refreshes credit balance
```

### 4. **Webhook (Optional)**
```
Razorpay sends webhook event
  → Backend verifies webhook signature
    → Processes payment event
      → Updates transaction status
        → Credits account if not already done
```

## API Endpoints

### Get Razorpay Configuration
```http
GET /api/razorpay/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keyId": "rzp_test_xxxxx",
    "currency": "INR"
  }
}
```

### Create Payment Order
```http
POST /api/razorpay/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "plan_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxxx",
    "amount": 100000,
    "currency": "INR",
    "keyId": "rzp_test_xxxxx",
    "plan": {
      "id": "plan_id",
      "name": "Starter Plan",
      "price": 1000,
      "baseCredits": 800,
      "bonusCredits": 200,
      "totalCredits": 1000
    }
  }
}
```

### Verify Payment
```http
POST /api/razorpay/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_xxxxx",
  "paymentId": "pay_xxxxx",
  "signature": "signature_xxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment successful! 1000 credits have been added to your account.",
  "data": {
    "creditsAdded": 1000,
    "transaction": {
      "_id": "transaction_id",
      "status": "success",
      "totalCredits": 1000
    }
  }
}
```

### Get Payment History
```http
GET /api/razorpay/history?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "transaction_id",
        "orderId": "order_xxxxx",
        "paymentId": "pay_xxxxx",
        "amount": 1000,
        "totalCredits": 1000,
        "status": "success",
        "createdAt": "2025-11-04T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

## Security Features

### 1. **Signature Verification**
All payment responses are verified using Razorpay signature:
```javascript
const generatedSignature = crypto
  .createHmac('sha256', keySecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

return generatedSignature === receivedSignature;
```

### 2. **Webhook Verification**
Webhook events are verified using webhook secret:
```javascript
const generatedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

return generatedSignature === webhookSignature;
```

### 3. **Amount Verification**
Backend verifies that the payment amount matches the plan price before processing.

### 4. **Idempotency**
Duplicate payment processing is prevented by checking transaction status before crediting.

## Error Handling

### Frontend Errors
- Payment gateway loading failure
- User cancellation
- Payment failure
- Network errors
- Verification failure

### Backend Errors
- Invalid plan ID
- Inactive plans
- Amount mismatch
- Signature verification failure
- Insufficient data
- Database errors

## Testing

### Test Cards (Razorpay Test Mode)

#### Success
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

#### Failure
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test Flow
1. Login as mess owner
2. Navigate to Platform Subscription
3. Click "Purchase Now" on any plan
4. Use test card credentials
5. Complete payment
6. Verify credits are added
7. Check transaction history

## Webhook Setup

### 1. Configure Webhook in Razorpay Dashboard

1. Go to Settings → Webhooks
2. Click "Add New Webhook"
3. Enter webhook URL: `https://yourdomain.com/api/razorpay/webhook`
4. Select events:
   - `payment.captured`
   - `payment.failed`
5. Save webhook secret

### 2. Update Environment Variable
```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Test Webhook
Use Razorpay's webhook testing tool in the dashboard to send test events.

## Troubleshooting

### Issue: Payment Modal Not Opening
**Solution:** Check browser console for script loading errors. Ensure Razorpay script is loaded.

### Issue: Payment Verification Fails
**Solution:** Verify that RAZORPAY_KEY_SECRET is correctly set in environment variables.

### Issue: Credits Not Added
**Solution:** Check backend logs for errors. Verify that MessCredits account exists for the mess.

### Issue: Webhook Not Working
**Solution:** Ensure webhook URL is publicly accessible and webhook secret is correct.

## Production Checklist

- [ ] Replace test API keys with live API keys
- [ ] Configure webhook with live URL
- [ ] Test with real payment (small amount)
- [ ] Verify webhook events are received
- [ ] Monitor transaction logs
- [ ] Set up error alerting
- [ ] Test refund process (if applicable)
- [ ] Document support procedures

## Support

For issues related to:
- **Razorpay API**: Contact Razorpay Support
- **Integration**: Check backend logs and frontend console
- **Credits**: Check MessCredits and CreditTransaction models

## References

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)


