import Notification from '../models/Notification';
import MessMembership from '../models/MessMembership';

import MessProfile from '../models/MessProfile';
import mongoose from 'mongoose';
import User from '../models/User';

export interface PaymentData {
  userId: string;
  messId: string;
  amount: number;
  method: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
  plan?: string;
  notes?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  data?: {
    paymentId: string;
    status: string;
    amount: number;
    method: string;
    transactionId?: string;
    paidAt: Date;
  };
  error?: string;
}

export class PaymentService {
  /**
   * Process a payment for a user's mess membership
   */
  static async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, messId, amount, method, plan, notes } = paymentData;

      // Validate user and mess
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const mess = await MessProfile.findById(messId);
      if (!mess) {
        throw new Error('Mess not found');
      }

      // Find user's membership
      const membership = await MessMembership.findOne({
        userId,
        messId,
        status: { $in: ['active', 'pending'] }
      });

      if (!membership) {
        throw new Error('User is not a member of this mess');
      }

      // Simulate payment processing (in real app, integrate with payment gateway)
      const paymentStatus = await this.simulatePaymentProcessing(method, amount);
      
      if (paymentStatus === 'success') {
        // Add payment to membership history
        await this.addPaymentToMembership(membership, {
          amount,
          method,
          status: 'success',
          transactionId: this.generateTransactionId(),
          notes
        });

        // Update membership status
        membership.paymentStatus = 'paid';
        membership.lastPaymentDate = new Date();
        await membership.save({ session });

        // Create success notification
        const lastPayment = membership.paymentHistory[membership.paymentHistory.length - 1];
        const notificationData: any = {
          amount,
          method,
          plan
        };
        
        if (lastPayment?.transactionId) {
          notificationData.transactionId = lastPayment.transactionId;
        }
        
        await this.createPaymentNotification(userId, messId, 'payment_success', notificationData);

        await session.commitTransaction();

        const result: any = {
          success: true,
          message: 'Payment processed successfully',
          data: {
            paymentId: membership._id.toString(),
            status: 'paid',
            amount,
            method,
            paidAt: new Date()
          }
        };
        
        if (lastPayment?.transactionId) {
          result.data.transactionId = lastPayment.transactionId;
        }
        
        return result;
      } else {
        // Add failed payment to history
        await this.addPaymentToMembership(membership, {
          amount,
          method,
          status: 'failed',
          notes: `Payment failed: ${notes || 'Unknown error'}`
        });

        // Create failure notification
        await this.createPaymentNotification(userId, messId, 'payment_failed', {
          amount,
          method,
          plan,
          error: 'Payment processing failed'
        });

        await session.commitTransaction();

        return {
          success: false,
          message: 'Payment processing failed',
          error: 'Payment gateway error'
        };
      }
    } catch (error) {
      await session.abortTransaction();
      console.error('Payment processing error:', error);
      
      return {
        success: false,
        message: 'Payment processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Update payment status for a membership
   */
  static async updatePaymentStatus(
    membershipId: string, 
    status: 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded',
    notes?: string
  ): Promise<boolean> {
    try {
      const membership = await MessMembership.findById(membershipId);
      if (!membership) {
        throw new Error('Membership not found');
      }

      membership.paymentStatus = status;
      
      if (status === 'paid') {
        membership.lastPaymentDate = new Date();
        membership.lateFees = 0;
      }

      await membership.save();

      // Create notification for status change
      await this.createPaymentNotification(
        membership.userId.toString(),
        membership.messId.toString(),
        'payment_status_update',
        {
          status,
          notes,
          amount: membership.paymentAmount
        }
      );

      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }

  /**
   * Send payment reminder notifications
   */
  static async sendPaymentReminders(): Promise<number> {
    try {
      // Find memberships that need reminders
      const memberships = await MessMembership.find({
        paymentStatus: { $in: ['pending', 'overdue'] },
        status: 'active',
        $or: [
          { lastReminderSent: { $exists: false } },
          { lastReminderSent: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // 7 days ago
        ]
      });

      let reminderCount = 0;

      for (const membership of memberships) {
        try {
          // Create reminder notification
          await this.createPaymentNotification(
            membership.userId.toString(),
            membership.messId.toString(),
            'payment_reminder',
            {
              amount: membership.paymentAmount,
              dueDate: membership.paymentDueDate,
              overdue: membership.paymentStatus === 'overdue',
              lateFees: membership.lateFees || 0
            }
          );

          // Update reminder count manually
          membership.reminderSentCount = (membership.reminderSentCount || 0) + 1;
          membership.lastReminderSent = new Date();
          await membership.save();
          
          reminderCount++;
        } catch (error) {
          console.error(`Error sending reminder for membership ${membership._id}:`, error);
        }
      }

      return reminderCount;
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      return 0;
    }
  }

  /**
   * Process overdue payments and update statuses
   */
  static async processOverduePayments(): Promise<number> {
    try {
      const overdueMemberships = await MessMembership.find({
        paymentStatus: 'pending',
        paymentDueDate: { $lt: new Date() },
        status: 'active'
      });

      let updatedCount = 0;

      for (const membership of overdueMemberships) {
        try {
          membership.paymentStatus = 'overdue';
          
          // Calculate late fees
          if (membership.paymentDueDate) {
            const daysOverdue = Math.floor((new Date().getTime() - membership.paymentDueDate.getTime()) / (24 * 60 * 60 * 1000));
            const weeksOverdue = Math.ceil(daysOverdue / 7);
            membership.lateFees = Math.round(membership.paymentAmount * 0.05 * weeksOverdue);
          }

          await membership.save();

          // Create overdue notification
          await this.createPaymentNotification(
            membership.userId.toString(),
            membership.messId.toString(),
            'payment_overdue',
            {
              amount: membership.paymentAmount,
              dueDate: membership.paymentDueDate,
              lateFees: membership.lateFees || 0
            }
          );

          updatedCount++;
        } catch (error) {
          console.error(`Error processing overdue membership ${membership._id}:`, error);
        }
      }

      return updatedCount;
    } catch (error) {
      console.error('Error processing overdue payments:', error);
      return 0;
    }
  }

  /**
   * Get payment history for a user
   */
  static async getPaymentHistory(userId: string, messId?: string): Promise<any[]> {
    try {
      const query: any = { userId };
      if (messId) query.messId = messId;

      const memberships = await MessMembership.find(query)
        .populate('messId', 'name')
        .populate('mealPlanId', 'name price');

      const history = [];
      for (const membership of memberships) {
        if (membership.paymentHistory && membership.paymentHistory.length > 0) {
          // Type assertion for populated fields
          const populatedMembership = membership as any;
          
          for (const payment of membership.paymentHistory) {
            history.push({
              membershipId: membership._id,
              messName: populatedMembership.messId?.name || 'Unknown Mess',
              planName: populatedMembership.mealPlanId?.name || 'Unknown Plan',
              date: payment.date,
              amount: payment.amount,
              method: payment.method,
              status: payment.status,
              transactionId: payment.transactionId,
              notes: payment.notes
            });
          }
        }
      }

      return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  /**
   * Add payment to membership history
   */
  private static async addPaymentToMembership(membership: any, paymentData: any): Promise<void> {
    if (!membership.paymentHistory) {
      membership.paymentHistory = [];
    }
    
    membership.paymentHistory.push({
      date: new Date(),
      amount: paymentData.amount,
      method: paymentData.method,
      status: paymentData.status,
      transactionId: paymentData.transactionId,
      notes: paymentData.notes
    });
  }

  /**
   * Simulate payment processing (replace with actual payment gateway integration)
   */
  private static async simulatePaymentProcessing(_method: string, _amount: number): Promise<'success' | 'failed'> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate different success rates based on payment method
    const successRates: Record<string, number> = {
      'upi': 0.95,
      'online': 0.90,
      'cash': 0.99,
      'bank_transfer': 0.85,
      'cheque': 0.80
    };

    const successRate = successRates[_method] || 0.90;
    return Math.random() < successRate ? 'success' : 'failed';
  }

  /**
   * Generate a unique transaction ID
   */
  private static generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Create payment-related notifications
   */
  private static async createPaymentNotification(
    userId: string,
    messId: string,
    type: string,
    data: any
  ): Promise<void> {
    try {
      const notification = new Notification({
        userId,
        messId,
        type,
        title: this.getNotificationTitle(type, data),
        message: this.getNotificationMessage(type, data),
        status: 'completed',
        data,
        isRead: false
      });

      await notification.save();
    } catch (error) {
      console.error('Error creating payment notification:', error);
    }
  }

  /**
   * Get notification title based on type
   */
  private static getNotificationTitle(type: string, data: any): string {
    switch (type) {
      case 'payment_success':
        return 'Payment Successful';
      case 'payment_failed':
        return 'Payment Failed';
      case 'payment_reminder':
        return data.overdue ? 'Payment Overdue' : 'Payment Reminder';
      case 'payment_overdue':
        return 'Payment Overdue';
      case 'payment_status_update':
        return `Payment Status: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`;
      default:
        return 'Payment Update';
    }
  }

  /**
   * Get notification message based on type
   */
  private static getNotificationMessage(type: string, data: any): string {
    switch (type) {
      case 'payment_success':
        return `Your payment of ₹${data.amount} has been processed successfully via ${data.method}. Transaction ID: ${data.transactionId}`;
      case 'payment_failed':
        return `Your payment of ₹${data.amount} via ${data.method} has failed. Please try again or contact support.`;
      case 'payment_reminder':
        if (data.overdue) {
          return `Your payment of ₹${data.amount} is overdue. Late fees: ₹${data.lateFees}. Please make the payment immediately.`;
        }
        return `Your payment of ₹${data.amount} is due on ${new Date(data.dueDate).toLocaleDateString()}. Please complete the payment to avoid late fees.`;
      case 'payment_overdue':
        return `Your payment of ₹${data.amount} is overdue. Late fees: ₹${data.lateFees}. Please make the payment immediately to avoid service suspension.`;
      case 'payment_status_update':
        return `Your payment status has been updated to ${data.status}. ${data.notes || ''}`;
      default:
        return 'Payment status has been updated.';
    }
  }
}

export default PaymentService;
