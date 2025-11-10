import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentGateway extends Document {
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
    processingFee: number; // Percentage
    fixedFee: number; // Fixed amount
    currency: string;
  };
  metadata: {
    description?: string;
    website?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentGatewaySchema = new Schema<IPaymentGateway>({
  name: {
    type: String,
    required: [true, 'Gateway name is required'],
    unique: true
  },
  type: {
    type: String,
    enum: ['razorpay', 'stripe', 'payu', 'paytm', 'custom'],
    required: [true, 'Gateway type is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  configuration: {
    apiKey: {
      type: String,
      required: [true, 'API key is required']
    },
    secretKey: {
      type: String,
      required: [true, 'Secret key is required']
    },
    webhookSecret: {
      type: String
    },
    merchantId: {
      type: String
    },
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox'
    },
    supportedCurrencies: [{
      type: String,
      default: 'INR'
    }],
    supportedMethods: [{
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'emi']
    }]
  },
  features: {
    supportsSubscriptions: {
      type: Boolean,
      default: false
    },
    supportsRefunds: {
      type: Boolean,
      default: true
    },
    supportsPartialRefunds: {
      type: Boolean,
      default: true
    },
    supportsWebhooks: {
      type: Boolean,
      default: true
    },
    supportsUPI: {
      type: Boolean,
      default: true
    },
    supportsCards: {
      type: Boolean,
      default: true
    },
    supportsNetBanking: {
      type: Boolean,
      default: true
    },
    supportsWallet: {
      type: Boolean,
      default: true
    }
  },
  limits: {
    minAmount: {
      type: Number,
      default: 1,
      min: [0, 'Minimum amount cannot be negative']
    },
    maxAmount: {
      type: Number,
      default: 1000000,
      min: [0, 'Maximum amount cannot be negative']
    },
    dailyLimit: {
      type: Number,
      default: 10000000,
      min: [0, 'Daily limit cannot be negative']
    },
    monthlyLimit: {
      type: Number,
      default: 100000000,
      min: [0, 'Monthly limit cannot be negative']
    }
  },
  fees: {
    processingFee: {
      type: Number,
      default: 2.0,
      min: [0, 'Processing fee cannot be negative']
    },
    fixedFee: {
      type: Number,
      default: 0,
      min: [0, 'Fixed fee cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  metadata: {
    description: {
      type: String
    },
    website: {
      type: String
    },
    supportEmail: {
      type: String
    },
    supportPhone: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Indexes
paymentGatewaySchema.index({ type: 1, isActive: 1 });
paymentGatewaySchema.index({ name: 1 });

// Static method to get active gateways
paymentGatewaySchema.statics.getActiveGateways = function() {
  return this.find({ isActive: true });
};

// Static method to get gateway by type
paymentGatewaySchema.statics.getByType = function(type: string) {
  return this.findOne({ type, isActive: true });
};

const PaymentGateway = mongoose.model<IPaymentGateway>('PaymentGateway', paymentGatewaySchema);

export default PaymentGateway;


