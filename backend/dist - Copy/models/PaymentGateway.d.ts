import mongoose, { Document } from 'mongoose';
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
        processingFee: number;
        fixedFee: number;
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
declare const PaymentGateway: mongoose.Model<IPaymentGateway, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentGateway> & IPaymentGateway & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default PaymentGateway;
//# sourceMappingURL=PaymentGateway.d.ts.map