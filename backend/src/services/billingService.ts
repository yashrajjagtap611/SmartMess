import mongoose from 'mongoose';
import Billing from '../models/Billing';
import Transaction from '../models/Transaction';
import MessMembership from '../models/MessMembership';
import MealPlan from '../models/MealPlan';
import MessProfile from '../models/MessProfile';
import User from '../models/User';
import PaymentGateway from '../models/PaymentGateway';
import {
  BillingSummary,
  PaymentAnalytics,
  BillingDashboardData,
  CreateBillingRequest,
  ProcessPaymentRequest,
  RefundRequest,
  BillingFilter,
  PaymentFilter,
  BillingReport,
  MessOwnerBillingData,
  UserBillingData
} from '../interfaces/billing';

export class BillingService {
  /**
   * Create a new billing record
   */
  static async createBilling(data: CreateBillingRequest) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get meal plan details
      const mealPlan = await MealPlan.findById(data.planId);
      if (!mealPlan) {
        throw new Error('Meal plan not found');
      }

      // Calculate billing period dates
      const startDate = new Date(data.billingPeriod.startDate);
      const endDate = new Date(data.billingPeriod.endDate);
      
      // Calculate base amount based on period
      let baseAmount = mealPlan.pricing.amount;
      if (data.billingPeriod.period === 'daily') {
        baseAmount = mealPlan.pricing.amount / 30; // Assuming monthly plan
      } else if (data.billingPeriod.period === 'weekly') {
        baseAmount = mealPlan.pricing.amount / 4; // Assuming monthly plan
      } else if (data.billingPeriod.period === '15days') {
        baseAmount = mealPlan.pricing.amount / 2; // Assuming monthly plan
      } else if (data.billingPeriod.period === '3months') {
        baseAmount = mealPlan.pricing.amount * 3; // Assuming monthly plan
      } else if (data.billingPeriod.period === '6months') {
        baseAmount = mealPlan.pricing.amount * 6; // Assuming monthly plan
      } else if (data.billingPeriod.period === 'yearly') {
        baseAmount = mealPlan.pricing.amount * 12; // Assuming monthly plan
      }

      // Calculate tax (assuming 18% GST)
      const taxAmount = baseAmount * 0.18;

      // Create billing record
      const billing = new Billing({
        userId: data.userId,
        messId: data.messId,
        membershipId: data.membershipId,
        billingPeriod: data.billingPeriod,
        subscription: {
          planId: data.planId,
          planName: mealPlan.name,
          baseAmount,
          discountAmount: 0,
          taxAmount,
          totalAmount: baseAmount + taxAmount
        },
        payment: {
          status: 'pending',
          method: 'online', // Default, will be updated during payment
          dueDate: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after period end
        },
        adjustments: data.adjustments || [],
        leaveCredits: [],
        metadata: data.metadata || { generatedBy: 'system' }
      });

      await billing.save({ session });

      // Update membership with billing reference
      await MessMembership.findByIdAndUpdate(
        data.membershipId,
        { 
          paymentAmount: billing.subscription.totalAmount,
          paymentDueDate: billing.payment.dueDate,
          nextPaymentDate: billing.payment.dueDate
        },
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        data: billing,
        message: 'Billing record created successfully'
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  

  /**
   * Process a payment
   */
  static async processPayment(data: ProcessPaymentRequest) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get billing record
      const billing = await Billing.findById(data.billingId);
      if (!billing) {
        throw new Error('Billing record not found');
      }

      // Get payment gateway
      const gateway = await PaymentGateway.findOne({ 
        type: data.paymentGateway || 'razorpay',
        isActive: true 
      });
      if (!gateway) {
        throw new Error('Payment gateway not found');
      }

      const paymentAmount = data.amount || billing.subscription.totalAmount;

      // Create transaction record
      const transaction = new Transaction({
        userId: billing.userId,
        messId: billing.messId,
        membershipId: billing.membershipId,
        billingId: billing._id,
        type: 'payment',
        amount: paymentAmount,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        gateway: {
          name: gateway.name,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        },
        description: `Payment for ${billing.subscription.planName} - ${billing.billingPeriod.startDate.toISOString().split('T')[0]} to ${billing.billingPeriod.endDate.toISOString().split('T')[0]}`,
        metadata: data.metadata
      });

      await transaction.save({ session });

      // Simulate payment processing (in real app, integrate with payment gateway)
      const paymentResult = await this.simulatePaymentProcessing(
        gateway,
        paymentAmount,
        data.paymentMethod
      );

      if (paymentResult.success) {
        // Update transaction
        transaction.status = 'success';
        transaction.gateway.transactionId = paymentResult.transactionId || '';
        transaction.gateway.gatewayResponse = paymentResult.response;
        await transaction.save({ session });

        // Update billing
        billing.payment.status = 'paid';
        billing.payment.paidDate = new Date();
        billing.payment.transactionId = transaction.transactionId;
        billing.payment.gatewayResponse = paymentResult.response;
        await billing.save({ session });

        // Update membership
        await MessMembership.findByIdAndUpdate(
          billing.membershipId,
          {
            paymentStatus: 'paid',
            lastPaymentDate: new Date(),
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          },
          { session }
        );

        await session.commitTransaction();

        return {
          success: true,
          data: {
            transactionId: transaction.transactionId,
            amount: paymentAmount,
            status: 'success'
          },
          message: 'Payment processed successfully'
        };
      } else {
        // Update transaction
        transaction.status = 'failed';
        transaction.gateway.gatewayResponse = paymentResult.response;
        await transaction.save({ session });

        // Update billing
        billing.payment.status = 'failed';
        await billing.save({ session });

        await session.commitTransaction();

        return {
          success: false,
          error: paymentResult.error,
          message: 'Payment processing failed'
        };
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Process a refund
   */
  static async processRefund(data: RefundRequest) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get transaction
      const transaction = await Transaction.findById(data.transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'success') {
        throw new Error('Cannot refund non-successful transaction');
      }

      if (data.refundAmount > transaction.amount) {
        throw new Error('Refund amount cannot exceed transaction amount');
      }

      // Process refund
      const refundResult = await this.simulateRefundProcessing(
        transaction.gateway.name,
        transaction.gateway.transactionId || '',
        data.refundAmount
      );

      if (refundResult.success) {
        // Update transaction
        (transaction as any).processRefund(
          data.refundAmount,
          data.refundReason,
          data.refundedBy,
          refundResult.refundId || ''
        );
        await transaction.save({ session });

        // Update billing if it exists
        if (transaction.billingId) {
          const billing = await Billing.findById(transaction.billingId);
          if (billing) {
            billing.payment.status = 'refunded';
            await billing.save({ session });
          }
        }

        await session.commitTransaction();

        return {
          success: true,
          data: {
            refundId: refundResult.refundId,
            refundAmount: data.refundAmount,
            status: 'success'
          },
          message: 'Refund processed successfully'
        };
      } else {
        await session.commitTransaction();

        return {
          success: false,
          error: refundResult.error,
          message: 'Refund processing failed'
        };
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get billing dashboard data for admin
   */
  static async getBillingDashboard(): Promise<BillingDashboardData> {
    const [
      billingSummary,
      paymentAnalytics,
      recentBills,
      recentTransactions,
      overduePayments
    ] = await Promise.all([
      this.getBillingSummary(),
      this.getPaymentAnalytics(),
      this.getRecentBills(10),
      this.getRecentTransactions(10),
      this.getOverduePayments()
    ]);

    return {
      summary: billingSummary,
      // Subscriptions removed
      payments: paymentAnalytics,
      recentBills,
      recentTransactions,
      overduePayments: overduePayments as any
    };
  }

  /**
   * Get mess owner billing data
   */
  static async getMessOwnerBillingData(messId: string): Promise<MessOwnerBillingData> {
    const mess = await MessProfile.findById(messId);
    if (!mess) {
      throw new Error('Mess not found');
    }

    const memberships = await MessMembership.find({ messId })
      .populate('userId', 'firstName lastName email phone')
      .populate('mealPlanId', 'name');

    const members = memberships.map(membership => {
      const populatedMembership = membership as any;
      const daysOverdue = membership.paymentDueDate && membership.paymentStatus === 'overdue' 
        ? Math.floor((new Date().getTime() - membership.paymentDueDate.getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      const firstName = populatedMembership.userId?.firstName || '';
      const lastName = populatedMembership.userId?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';

      return {
        userId: membership.userId._id.toString(),
        userName: fullName,
        userEmail: populatedMembership.userId?.email || '',
        userPhone: populatedMembership.userId?.phone || '',
        membershipId: membership._id.toString(),
        planName: populatedMembership.mealPlanId?.name || 'Unknown Plan',
        status: membership.status,
        paymentStatus: membership.paymentStatus,
        amount: membership.paymentAmount,
        dueDate: membership.paymentDueDate,
        lastPaymentDate: membership.lastPaymentDate,
        daysOverdue
      };
    });

    const summary = {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      totalRevenue: members.reduce((sum, m) => sum + m.amount, 0),
      monthlyRevenue: members
        .filter(m => m.status === 'active')
        .reduce((sum, m) => sum + m.amount, 0),
      pendingAmount: members
        .filter(m => m.paymentStatus === 'pending')
        .reduce((sum, m) => sum + m.amount, 0),
      overdueAmount: members
        .filter(m => m.paymentStatus === 'overdue')
        .reduce((sum, m) => sum + m.amount, 0)
    };

    const recentBills = await this.getRecentBills(10, messId);
    const recentTransactions = await this.getRecentTransactions(10, messId);

    // Fetch payment verification records (which contain transaction ID and screenshot)
    const PaymentVerification = require('../models/PaymentVerification').default;
    const paymentVerifications = await PaymentVerification.find({ messId })
      .populate('userId', 'firstName lastName email phone')
      .populate('mealPlanId', 'name')
      .sort({ createdAt: -1 }); // Sort by most recent first

    // Also get memberships with payment request status for backward compatibility
    const allRequestMemberships = await MessMembership.find({
      messId,
      paymentRequestStatus: { $in: ['sent', 'approved', 'rejected'] }
    })
      .populate('userId', 'firstName lastName email phone')
      .populate('mealPlanId', 'name')
      .sort({ updatedAt: -1 });

    // Map payment verifications to payment requests format
    const paymentRequests = (paymentVerifications || []).map((pv: any) => {
      const firstName = pv.userId?.firstName || '';
      const lastName = pv.userId?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
      
      // Map PaymentVerification status to display status
      let displayStatus: 'sent' | 'approved' | 'rejected' = 'sent';
      if (pv.status === 'approved') {
        displayStatus = 'approved';
      } else if (pv.status === 'rejected') {
        displayStatus = 'rejected';
      } else if (pv.status === 'pending') {
        displayStatus = 'sent'; // Map 'pending' to 'sent' for display
      }
      
      return {
        id: pv._id.toString(),
        requestId: pv._id.toString(),
        membershipId: pv.membershipId?.toString() || '',
        userId: pv.userId?._id?.toString?.() || '',
        userName: fullName,
        userEmail: pv.userId?.email || '',
        userPhone: pv.userId?.phone || '',
        planId: pv.mealPlanId?._id?.toString?.() || null,
        planName: pv.mealPlanId?.name || 'Unknown Plan',
        amount: pv.amount || 0,
        status: displayStatus,
        paymentMethod: pv.paymentMethod || 'online',
        transactionId: pv.transactionId || null, // Include transaction ID
        paymentScreenshot: pv.paymentScreenshot || null, // Include payment screenshot
        receiptUrl: pv.paymentScreenshot || null, // Alias for backward compatibility
        requestedAt: pv.updatedAt || pv.createdAt, // Use updatedAt to show resubmission time, fallback to createdAt
        updatedAt: pv.updatedAt,
        approvedAt: pv.status === 'approved' ? (pv.verifiedAt || pv.updatedAt) : undefined,
        rejectedAt: pv.status === 'rejected' ? (pv.verifiedAt || pv.updatedAt) : undefined
      };
    });

    return {
      messId,
      messName: mess.name,
      summary,
      members: members as any,
      paymentRequests,
      recentBills,
      recentTransactions
    };
  }

  /**
   * Get user billing data
   */
  static async getUserBillingData(userId: string): Promise<UserBillingData> {
    console.log('getUserBillingData called with userId:', userId);
    
    // Only get active memberships (not pending, inactive, or suspended ones)
    const memberships = await MessMembership.find({ 
      userId, 
      status: 'active' // Only active/approved memberships
    })
      .populate('messId', 'name')
      .populate('mealPlanId', 'name _id'); // Include _id for mealPlanId
    console.log('Found active memberships:', memberships.length);

    // Get active membership IDs to filter bills
    const activeMembershipIds = memberships.map(m => m._id);
    
    // Only get bills for active memberships and recent bills (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const bills = await Billing.find({ 
      userId,
      $or: [
        { membershipId: { $in: activeMembershipIds } }, // Bills for active memberships
        { 
          createdAt: { $gte: threeMonthsAgo }, // Or recent bills (last 3 months)
          'payment.status': { $in: ['pending', 'overdue'] } // That are still pending/overdue
        }
      ]
    })
      .populate('messId', 'name')
      .populate('subscription.planId', 'name')
      .sort({ createdAt: -1 });
    console.log('Found bills:', bills.length);

    const transactions = await Transaction.find({ 
      userId,
      type: 'payment' // Only get payment transactions
    })
      .populate('messId', 'name')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 transactions
    console.log('Found transactions:', transactions.length);
    if (transactions && transactions.length > 0 && transactions[0]) {
      const firstTransaction = transactions[0];
      console.log('Sample transaction:', {
        id: firstTransaction._id.toString(),
        transactionId: firstTransaction.transactionId,
        amount: firstTransaction.amount,
        status: firstTransaction.status,
        paymentMethod: firstTransaction.paymentMethod
      });
    }

    const summary = {
      totalBills: bills.length,
      paidBills: bills.filter((b: any) => b.payment.status === 'paid').length,
      pendingBills: bills.filter((b: any) => b.payment.status === 'pending').length,
      overdueBills: bills.filter((b: any) => b.payment.status === 'overdue').length,
      totalAmount: bills.reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0),
      paidAmount: bills
        .filter((b: any) => b.payment.status === 'paid')
        .reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0),
      pendingAmount: bills
        .filter((b: any) => b.payment.status === 'pending')
        .reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0),
      overdueAmount: bills
        .filter((b: any) => b.payment.status === 'overdue')
        .reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0)
    };

    const membershipData = memberships.map(membership => {
      const populatedMembership = membership as any;
      return {
        messId: membership.messId._id.toString(),
        messName: populatedMembership.messId?.name || 'Unknown Mess',
        membershipId: membership._id.toString(),
        mealPlanId: membership.mealPlanId?._id?.toString() || membership.mealPlanId?.toString() || null, // Add mealPlanId
        planName: populatedMembership.mealPlanId?.name || 'Unknown Plan',
        status: membership.status,
        paymentStatus: membership.paymentStatus,
        paymentRequestStatus: membership.paymentRequestStatus || 'none',
        amount: membership.paymentAmount,
        dueDate: membership.paymentDueDate,
        lastPaymentDate: membership.lastPaymentDate,
        nextPaymentDate: membership.nextPaymentDate,
        subscriptionStartDate: membership.subscriptionStartDate,
        subscriptionEndDate: membership.subscriptionEndDate,
        autoRenewal: membership.autoRenewal
      };
    });

    const billData = bills.map((bill: any) => {
      const populatedBill = bill as any;
      
      // Debug logging for subscription extension
      if (bill.subscriptionExtension) {
        console.log('Found subscription extension in bill:', {
          billId: bill._id.toString(),
          extensionMeals: bill.subscriptionExtension.extensionMeals,
          extensionDays: bill.subscriptionExtension.extensionDays
        });
      }
      
      return {
        id: bill._id.toString(),
        messName: populatedBill.messId?.name || 'Unknown Mess',
        planName: bill.subscription.planName,
        amount: bill.subscription.totalAmount,
        status: bill.payment.status,
        paymentStatus: bill.payment.status,
        dueDate: bill.payment.dueDate,
        paidDate: bill.payment.paidDate,
        description: bill.subscription.planName, // Use plan name as description
        createdAt: bill.createdAt,
        // Include subscription extension if present
        subscriptionExtension: bill.subscriptionExtension ? {
          extensionMeals: bill.subscriptionExtension.extensionMeals,
          extensionDays: bill.subscriptionExtension.extensionDays,
          originalEndDate: bill.subscriptionExtension.originalEndDate,
          newEndDate: bill.subscriptionExtension.newEndDate
        } : undefined,
        // Include adjustments and leave credits
        adjustments: bill.adjustments || [],
        leaveCredits: bill.leaveCredits || []
      };
    });

    const transactionData = transactions.map(transaction => {
      const populatedTransaction = transaction as any;
      return {
        id: transaction._id.toString(),
        transactionId: transaction.transactionId || transaction._id.toString(),
        messName: populatedTransaction.messId?.name || 'Unknown Mess',
        amount: transaction.amount,
        status: transaction.status, // Backend returns 'success', frontend will map to 'completed'
        method: transaction.paymentMethod,
        paymentMethod: transaction.paymentMethod,
        description: transaction.description || `Payment transaction`,
        paymentDate: transaction.createdAt,
        createdAt: transaction.createdAt
      };
    });
    
    console.log(`📊 getUserBillingData: Found ${transactions.length} transactions for user ${userId}`);

    return {
      userId,
      summary,
      memberships: membershipData as any,
      bills: billData as any,
      transactions: transactionData,
      // Additional data for frontend features
      invoices: [], // Will be implemented later
      receipts: [], // Will be implemented later
      subscriptionSettings: [], // Will be implemented later
      renewalHistory: [], // Will be implemented later
      installmentPlans: [], // Will be implemented later
      installmentPayments: [] // Will be implemented later
    };
  }

  /**
   * Get billing summary
   */
  private static async getBillingSummary(): Promise<BillingSummary> {
    const bills = await Billing.find();
    
    const totalBills = bills.length;
    const paidBills = bills.filter((b: any) => b.payment.status === 'paid').length;
    const pendingBills = bills.filter((b: any) => b.payment.status === 'pending').length;
    const overdueBills = bills.filter((b: any) => b.payment.status === 'overdue').length;
    
    const totalAmount = bills.reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0);
    const paidAmount = bills
      .filter((b: any) => b.payment.status === 'paid')
      .reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0);
    const pendingAmount = bills
      .filter((b: any) => b.payment.status === 'pending')
      .reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0);
    const overdueAmount = bills
      .filter((b: any) => b.payment.status === 'overdue')
      .reduce((sum: number, b: any) => sum + b.subscription.totalAmount, 0);

    return {
      totalBills,
      paidBills,
      pendingBills,
      overdueBills,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      averageBillAmount: totalBills > 0 ? totalAmount / totalBills : 0,
      collectionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  }

  

  /**
   * Get payment analytics
   */
  private static async getPaymentAnalytics(): Promise<PaymentAnalytics> {
    const transactions = await Transaction.find();
    
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(t => t.status === 'success').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    const refundedTransactions = transactions.filter(t => t.status === 'refunded').length;
    
    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
    const refundRate = successfulTransactions > 0 ? (refundedTransactions / successfulTransactions) * 100 : 0;

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      refundedTransactions,
      totalVolume,
      averageTransactionValue,
      successRate,
      refundRate
    };
  }

  /**
   * Get recent bills
   */
  private static async getRecentBills(limit: number, messId?: string) {
    const query: any = {};
    if (messId) query.messId = messId;

    const bills = await Billing.find(query)
      .populate('userId', 'firstName lastName')
      .populate('messId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    return bills.map((bill: any) => {
      const populatedBill = bill as any;
      const firstName = populatedBill.userId?.firstName || '';
      const lastName = populatedBill.userId?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
      
      return {
        id: bill._id.toString(),
        userId: bill.userId._id.toString(),
        userName: fullName,
        messName: populatedBill.messId?.name || 'Unknown Mess',
        amount: bill.subscription.totalAmount,
        status: bill.payment.status,
        dueDate: bill.payment.dueDate,
        createdAt: bill.createdAt
      };
    });
  }

  /**
   * Get recent transactions
   */
  private static async getRecentTransactions(limit: number, messId?: string) {
    const query: any = {};
    if (messId) query.messId = messId;

    const transactions = await Transaction.find(query)
      .populate('userId', 'firstName lastName')
      .populate('messId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    return transactions.map(transaction => {
      const populatedTransaction = transaction as any;
      const firstName = populatedTransaction.userId?.firstName || '';
      const lastName = populatedTransaction.userId?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
      
      return {
        id: transaction._id.toString(),
        transactionId: transaction.transactionId,
        userId: transaction.userId._id.toString(),
        userName: fullName,
        amount: transaction.amount,
        status: transaction.status,
        method: transaction.paymentMethod,
        createdAt: transaction.createdAt
      };
    });
  }

  /**
   * Get overdue payments
   */
  private static async getOverduePayments() {
    const bills = await Billing.find({ 'payment.status': 'overdue' })
      .populate('userId', 'firstName lastName email phone')
      .populate('messId', 'name');

    return bills.map((bill: any) => {
      const populatedBill = bill as any;
      const daysOverdue = Math.floor(
        (new Date().getTime() - bill.payment.dueDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        id: bill._id.toString(),
        userId: bill.userId._id.toString(),
        userName: `${populatedBill.userId?.firstName || ''} ${populatedBill.userId?.lastName || ''}`.trim() || 'Unknown User',
        userEmail: populatedBill.userId?.email || '',
        userPhone: populatedBill.userId?.phone || '',
        messName: populatedBill.messId?.name || 'Unknown Mess',
        amount: bill.subscription.totalAmount,
        daysOverdue,
        lastReminderSent: undefined // This would need to be tracked separately
      };
    });
  }

  /**
   * Simulate payment processing
   */
  private static async simulatePaymentProcessing(
    gateway: any,
    amount: number,
    method: string
  ): Promise<{ success: boolean; transactionId?: string; response?: any; error?: string }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 95% success rate
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        transactionId: `GATEWAY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        response: {
          gateway: gateway.name,
          status: 'success',
          amount,
          method,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        error: 'Payment gateway error',
        response: {
          gateway: gateway.name,
          status: 'failed',
          error: 'Payment processing failed',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate billing report for a mess
   */
  static async generateBillingReport(messId: string, startDate: string, endDate: string) {
    try {
      const mess = await MessProfile.findById(messId);
      if (!mess) {
        throw new Error('Mess not found');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get memberships within the date range
      const memberships = await MessMembership.find({
        messId,
        createdAt: { $gte: start, $lte: end }
      })
        .populate('userId', 'firstName lastName email phone')
        .populate('mealPlanId', 'name');

      // Get billing records within the date range
      const billingRecords = await Billing.find({
        messId,
        createdAt: { $gte: start, $lte: end }
      })
        .populate('userId', 'firstName lastName email phone')
        .populate('subscription.planId', 'name');

      // Calculate summary statistics
      const totalMembers = memberships.length;
      const activeMembers = memberships.filter(m => m.status === 'active').length;
      const paidMembers = memberships.filter(m => m.paymentStatus === 'paid').length;
      const pendingMembers = memberships.filter(m => m.paymentStatus === 'pending').length;
      const overdueMembers = memberships.filter(m => m.paymentStatus === 'overdue').length;

      const totalRevenue = memberships.reduce((sum, m) => sum + m.paymentAmount, 0);
      const paidAmount = memberships
        .filter(m => m.paymentStatus === 'paid')
        .reduce((sum, m) => sum + m.paymentAmount, 0);
      const pendingAmount = memberships
        .filter(m => m.paymentStatus === 'pending')
        .reduce((sum, m) => sum + m.paymentAmount, 0);
      const overdueAmount = memberships
        .filter(m => m.paymentStatus === 'overdue')
        .reduce((sum, m) => sum + m.paymentAmount, 0);

      // Get recent transactions
      const recentTransactions = await Transaction.find({
        messId,
        createdAt: { $gte: start, $lte: end }
      })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(10);

      const report = {
        messId,
        messName: mess.name,
        period: {
          startDate,
          endDate
        },
        summary: {
          totalMembers,
          activeMembers,
          paidMembers,
          pendingMembers,
          overdueMembers,
          totalRevenue,
          paidAmount,
          pendingAmount,
          overdueAmount,
          collectionRate: totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0
        },
        members: memberships.map(membership => {
          const populatedMembership = membership as any;
          return {
            userId: membership.userId._id.toString(),
            userName: populatedMembership.userId?.name || 'Unknown User',
            userEmail: populatedMembership.userId?.email || '',
            userPhone: populatedMembership.userId?.phone || '',
            membershipId: membership._id.toString(),
            planName: populatedMembership.mealPlanId?.name || 'Unknown Plan',
            status: membership.status,
            paymentStatus: membership.paymentStatus,
            amount: membership.paymentAmount,
            dueDate: membership.paymentDueDate,
            lastPaymentDate: membership.lastPaymentDate,
            createdAt: membership.createdAt
          };
        }),
        recentTransactions: recentTransactions.map(transaction => {
          const populatedTransaction = transaction as any;
          return {
            id: transaction._id.toString(),
            transactionId: transaction.transactionId,
            userId: transaction.userId._id.toString(),
            userName: populatedTransaction.userId?.name || 'Unknown User',
            amount: transaction.amount,
            status: transaction.status,
            method: transaction.gateway.name,
            createdAt: transaction.createdAt
          };
        }),
        generatedAt: new Date().toISOString()
      };

      return report;
    } catch (error) {
      console.error('Error generating billing report:', error);
      throw error;
    }
  }

  /**
   * Simulate refund processing
   */
  private static async simulateRefundProcessing(
    gatewayName: string,
    transactionId: string,
    refundAmount: number
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 90% success rate for refunds
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        refundId: `REF_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      };
    } else {
      return {
        success: false,
        error: 'Refund processing failed'
      };
    }
  }
}

export default BillingService;