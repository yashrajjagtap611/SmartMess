import apiClient from '../api';

export interface BillingSummary {
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  overdueBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageBillAmount: number;
  collectionRate: number;
}

// Subscriptions removed

export interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  successRate: number;
  refundRate: number;
}

export interface BillingDashboardData {
  summary: BillingSummary;
  payments: PaymentAnalytics;
  recentBills: Array<{
    id: string;
    userId: string;
    userName: string;
    messName: string;
    amount: number;
    status: string;
    dueDate: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    transactionId: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
  overduePayments: Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    messName: string;
    amount: number;
    daysOverdue: number;
    lastReminderSent?: string;
  }>;
}

export interface MessOwnerBillingData {
  messId: string;
  messName: string;
  summary: {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  members: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    membershipId: string;
    planName: string;
    status: string;
    paymentStatus: string;
    amount: number;
    dueDate?: string;
    lastPaymentDate?: string;
    daysOverdue?: number;
  }>;
  recentBills: Array<{
    id: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
    dueDate: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    transactionId: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
  // Added: pending payment requests for Requests tab
  paymentRequests?: Array<{
    requestId: string;
    membershipId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    planId?: string | null;
    planName: string;
    amount: number;
    status: string; // 'sent' | 'approved' | 'rejected'
    requestedAt?: string;
    paymentMethod?: string;
  }>;
}

export interface UserBillingData {
  userId: string;
  summary: {
    totalBills: number;
    paidBills: number;
    pendingBills: number;
    overdueBills: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  memberships: Array<{
    messId: string;
    messName: string;
    membershipId: string;
    planName: string;
    status: string;
    paymentStatus: string;
    amount: number;
    dueDate?: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    autoRenewal: boolean;
  }>;
  bills: Array<{
    id: string;
    messName: string;
    planName: string;
    amount: number;
    status: string;
    paymentStatus: string;
    dueDate: string;
    paidDate?: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    transactionId: string;
    messName: string;
    amount: number;
    status: string;
    method: string;
    description: string;
    createdAt: string;
  }>;
  // Additional data for frontend features
  invoices?: Array<any>;
  receipts?: Array<any>;
  subscriptionSettings?: Array<any>;
  renewalHistory?: Array<any>;
  installmentPlans?: Array<any>;
  installmentPayments?: Array<any>;
}

export interface PaymentGateway {
  type: string;
  name: string;
  apiKey: string;
  environment: string;
  supportedCurrencies: string[];
  supportedMethods: string[];
  features: {
    supportsSubscriptions: boolean;
    supportsRefunds: boolean;
    supportsUPI: boolean;
    supportsCards: boolean;
    supportsNetBanking: boolean;
    supportsWallet: boolean;
  };
  limits: {
    minAmount: number;
    maxAmount: number;
  };
}

export interface PaymentRequest {
  billingId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  method: string;
  gateway: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  gatewayResponse?: any;
  error?: string;
}

// Subscription plan types removed

class BillingService {
  // Admin billing methods
  async getBillingDashboard(): Promise<{ success: boolean; data?: BillingDashboardData; message?: string }> {
    try {
      const response = await apiClient.get('/billing/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching billing dashboard:', error);
      return { success: false, message: 'Failed to fetch billing dashboard' };
    }
  }

  async getMessOwnerBillingData(messId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.get(`/billing/mess-owner/${messId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mess owner billing data:', error);
      return { success: false, message: 'Failed to fetch billing data' };
    }
  }

  // Subscription endpoints removed

  // Mess owner billing methods (moved to enhanced section below)

  async sendBulkPaymentReminders(membershipIds: string[]): Promise<{ success: boolean; data?: { reminderCount: number }; message?: string }> {
    try {
      const response = await apiClient.post('/payments/bulk-remind', { membershipIds });
      return response.data;
    } catch (error) {
      console.error('Error sending bulk payment reminders:', error);
      return { success: false, message: 'Failed to send bulk reminders' };
    }
  }

  // Payment status and billing report methods (moved to enhanced section below)

  // User billing methods
  async getUserBillingData(): Promise<{ success: boolean; data?: UserBillingData; message?: string }> {
    try {
      const response = await apiClient.get('/billing/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user billing data:', error);
      return { success: false, message: 'Failed to fetch user billing data' };
    }
  }

  // Pay bill method (moved to enhanced section below)

  async processPayment(paymentRequest: PaymentRequest): Promise<{ success: boolean; data?: PaymentResponse; message?: string }> {
    try {
      const response = await apiClient.post('/billing/payments/create-order', paymentRequest);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, message: 'Failed to process payment' };
    }
  }

  async verifyPayment(transactionId: string, paymentData: any): Promise<{ success: boolean; data?: PaymentResponse; message?: string }> {
    try {
      const response = await apiClient.post('/billing/payments/verify', {
        transactionId,
        paymentData
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, message: 'Failed to verify payment' };
    }
  }

  async getPaymentGateways(): Promise<{ success: boolean; data?: PaymentGateway[]; message?: string }> {
    try {
      const response = await apiClient.get('/billing/payments/gateways');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      return { success: false, message: 'Failed to fetch payment gateways' };
    }
  }

  async getGatewayConfig(gatewayType: string): Promise<{ success: boolean; data?: PaymentGateway; message?: string }> {
    try {
      const response = await apiClient.get(`/billing/payments/gateway-config/${gatewayType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gateway config:', error);
      return { success: false, message: 'Failed to fetch gateway config' };
    }
  }

  

  async updatePaymentSettings(settings: {
    autoRenewal: boolean;
    paymentMethod: string;
    upiId?: string;
    bankAccount?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put('/billing/payment-settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating payment settings:', error);
      return { success: false, message: 'Failed to update payment settings' };
    }
  }


  // Billing management methods
  async createBilling(billingData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post('/billing/create', billingData);
      return response.data;
    } catch (error) {
      console.error('Error creating billing:', error);
      return { success: false, message: 'Failed to create billing' };
    }
  }

  async updateBillingStatus(membershipId: string, status: string, notes?: string, paymentMethod?: string): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await apiClient.put(`/billing/payment-status/${membershipId}`, { 
        status, 
        notes, 
        paymentMethod 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating billing status:', error);
      return { success: false, message: 'Failed to update billing status' };
    }
  }

  async getBillingDetails(billingId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.get(`/billing/${billingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching billing details:', error);
      return { success: false, message: 'Failed to fetch billing details' };
    }
  }

  // Subscription management methods removed

  // Payment methods
  async processRefund(transactionId: string, amount: number, reason: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post('/billing/payments/refund', {
        transactionId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, message: 'Failed to process refund' };
    }
  }

  async getPaymentHistory(userId?: string, messId?: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const response = await apiClient.get('/payments/history', {
        params: { userId, messId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return { success: false, message: 'Failed to fetch payment history' };
    }
  }

  async getOverduePayments(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const response = await apiClient.get('/payments/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      return { success: false, message: 'Failed to fetch overdue payments' };
    }
  }

  // Enhanced billing methods for mess owners (updated versions)

  async bulkUpdatePaymentStatus(membershipIds: string[], status: string, notes?: string): Promise<{ success: boolean; message?: string; processed: number; errors: string[] }> {
    try {
      const response = await apiClient.put('/billing/bulk-payment-status', {
        membershipIds,
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating payment status:', error);
      return { success: false, message: 'Failed to bulk update payment status', processed: 0, errors: [String(error)] };
    }
  }

  async verifyPaymentRequest(requestId: string, verified: boolean, notes?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put(`/billing/verify-payment-request/${requestId}`, {
        verified,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment request:', error);
      return { success: false, message: 'Failed to verify payment request' };
    }
  }

  // Approve payment request (dedicated endpoint)
  async approvePaymentRequest(membershipId: string, paymentMethod?: string): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await apiClient.post(`/payment-requests/${membershipId}/approve`, { paymentMethod });
      return response.data;
    } catch (error: any) {
      console.error('Error approving payment request:', error);
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve payment request';
      const errorData = error.response?.data?.data;
      return { 
        success: false, 
        message: errorMessage,
        data: errorData // Include credit info if available
      };
    }
  }

  // Reject payment request (dedicated endpoint)
  async rejectPaymentRequest(membershipId: string, remarks?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post(`/payment-requests/${membershipId}/reject`, { remarks });
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting payment request:', error);
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reject payment request';
      return { success: false, message: errorMessage };
    }
  }


  // Removed: generateIndividualBill

  async sendBulkReminders(membershipIds: string[], message?: string): Promise<{ success: boolean; message?: string; sent: number; failed: number }> {
    try {
      const response = await apiClient.post('/billing/send-bulk-reminders', {
        membershipIds,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      return { success: false, message: 'Failed to send bulk reminders', sent: 0, failed: membershipIds.length };
    }
  }

  // Removed: calculateBillWithLeaves

  async calculateUserBilling(data: {
    planId: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    approvedLeaves?: any[];
    extensionId?: string;
    discountAmount?: number;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post('/billing/calculate-user-billing', data);
      return response.data;
    } catch (error) {
      console.error('Error calculating user billing:', error);
      return { success: false, message: 'Failed to calculate user billing' };
    }
  }

  async sendPaymentReminder(membershipId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post(`/billing/send-payment-reminder/${membershipId}`);
      return response.data;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return { success: false, message: 'Failed to send payment reminder' };
    }
  }

  async generateBillingReport(messId: string, startDate: string, endDate: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post('/billing/generate-report', {
        messId,
        startDate,
        endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error generating billing report:', error);
      return { success: false, message: 'Failed to generate billing report' };
    }
  }

  // User billing methods
  async submitPaymentRequest(billId: string, paymentMethod: string, receiptFile?: File, transactionId?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('billId', billId);
      formData.append('paymentMethod', paymentMethod);
      if (transactionId) formData.append('transactionId', transactionId);
      if (receiptFile) formData.append('receipt', receiptFile);

      const response = await apiClient.post('/billing/submit-payment-request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting payment request:', error);
      return { success: false, message: 'Failed to submit payment request' };
    }
  }

  async payBill(billId: string, paymentMethod: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/billing/pay-bill', {
        billId,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error paying bill:', error);
      return { success: false, error: 'Failed to process payment' };
    }
  }

  // Invoice Management
  async downloadInvoice(invoiceId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.get(`/billing/invoices/${invoiceId}/download`);
      return response.data;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return { success: false, message: 'Failed to download invoice' };
    }
  }

  async generateInvoice(billId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post(`/billing/invoices/generate`, { billId });
      return response.data;
    } catch (error) {
      console.error('Error generating invoice:', error);
      return { success: false, message: 'Failed to generate invoice' };
    }
  }

  // Receipt Management
  // Removed: uploadReceipt

  // Auto-Renewal Management
  // Subscription settings removed

  // Installment Plans
  async createInstallmentPlan(planData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post('/billing/installment-plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating installment plan:', error);
      return { success: false, message: 'Failed to create installment plan' };
    }
  }

  // Mess Owner Installment Plans
  async getInstallmentPlans(messId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.get(`/billing/mess-owner/${messId}/installment-plans`);
      return response.data;
    } catch (error) {
      console.error('Error fetching installment plans:', error);
      return { success: false, message: 'Failed to fetch installment plans' };
    }
  }

  async getInstallmentPayments(messId: string, planId?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const url = planId 
        ? `/billing/mess-owner/${messId}/installment-plans/${planId}/payments`
        : `/billing/mess-owner/${messId}/installment-payments`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching installment payments:', error);
      return { success: false, message: 'Failed to fetch installment payments' };
    }
  }

  async updateInstallmentPlan(planId: string, updates: any): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put(`/billing/installment-plans/${planId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating installment plan:', error);
      return { success: false, message: 'Failed to update installment plan' };
    }
  }

  async deleteInstallmentPlan(planId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete(`/billing/installment-plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting installment plan:', error);
      return { success: false, message: 'Failed to delete installment plan' };
    }
  }

  async updateInstallmentPayment(paymentId: string, updates: any): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put(`/billing/installment-payments/${paymentId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating installment payment:', error);
      return { success: false, message: 'Failed to update installment payment' };
    }
  }

  async payInstallment(paymentId: string, paymentData: any): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post(`/billing/installment-payments/${paymentId}/pay`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error paying installment:', error);
      return { success: false, message: 'Failed to process installment payment' };
    }
  }
}

export const billingService = new BillingService();
export default billingService;
