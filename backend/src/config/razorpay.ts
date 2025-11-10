import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Razorpay configuration
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  currency: 'INR',
  receiptPrefix: 'SM_CREDIT_'
};

// Validate Razorpay configuration
export const validateRazorpayConfig = (): boolean => {
  if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
    console.warn('⚠️  Razorpay credentials not configured. Payment features will be disabled.');
    return false;
  }
  return true;
};

export default razorpayInstance;


