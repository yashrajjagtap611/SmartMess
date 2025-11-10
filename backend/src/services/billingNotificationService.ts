import mongoose from 'mongoose';
import Notification from '../models/Notification';
import User from '../models/User';
import MessProfile from '../models/MessProfile';
import Billing from '../models/Billing';
import MessMembership from '../models/MessMembership';

export class BillingNotificationService {
  /**
   * Send payment due reminder
   */
  static async sendPaymentDueReminder(billingId: string) {
    try {
      const billing = await Billing.findById(billingId)
        .populate('userId', 'name email phone')
        .populate('messId', 'name');

      if (!billing) {
        throw new Error('Billing record not found');
      }

      const populatedBilling = billing as any;
      const daysUntilDue = Math.ceil(
        (billing.payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const notification = new Notification({
        userId: billing.userId,
        messId: billing.messId,
        type: 'payment_due_reminder',
        title: 'Payment Due Soon',
        message: `Your payment of ₹${billing.subscription.totalAmount} for ${populatedBilling.messId?.name} is due in ${daysUntilDue} days.`,
        status: 'completed',
        data: {
          billingId: billing._id,
          amount: billing.subscription.totalAmount,
          dueDate: billing.payment.dueDate,
          daysUntilDue
        },
        isRead: false
      });

      await notification.save();

      return {
        success: true,
        message: 'Payment due reminder sent successfully'
      };
    } catch (error) {
      console.error('Error sending payment due reminder:', error);
      throw error;
    }
  }

  /**
   * Send payment overdue notification
   */
  static async sendPaymentOverdueNotification(billingId: string) {
    try {
      const billing = await Billing.findById(billingId)
        .populate('userId', 'name email phone')
        .populate('messId', 'name');

      if (!billing) {
        throw new Error('Billing record not found');
      }

      const populatedBilling = billing as any;
      const daysOverdue = Math.floor(
        (new Date().getTime() - billing.payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const notification = new Notification({
        userId: billing.userId,
        messId: billing.messId,
        type: 'payment_overdue',
        title: 'Payment Overdue',
        message: `Your payment of ₹${billing.subscription.totalAmount} for ${populatedBilling.messId?.name} is ${daysOverdue} days overdue. Please make the payment immediately to avoid service suspension.`,
        status: 'completed',
        data: {
          billingId: billing._id,
          amount: billing.subscription.totalAmount,
          dueDate: billing.payment.dueDate,
          daysOverdue
        },
        isRead: false
      });

      await notification.save();

      return {
        success: true,
        message: 'Payment overdue notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending payment overdue notification:', error);
      throw error;
    }
  }

  /**
   * Send payment success notification
   */
  static async sendPaymentSuccessNotification(transactionId: string) {
    try {
      const Transaction = require('../models/Transaction').default;
      const transaction = await Transaction.findById(transactionId)
        .populate('userId', 'name email phone')
        .populate('messId', 'name');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const populatedTransaction = transaction as any;

      const notification = new Notification({
        userId: transaction.userId,
        messId: transaction.messId,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of ₹${transaction.amount} for ${populatedTransaction.messId?.name} has been processed successfully.`,
        status: 'completed',
        data: {
          transactionId: transaction._id,
          amount: transaction.amount,
          method: transaction.paymentMethod,
          gateway: transaction.gateway.name
        },
        isRead: false
      });

      await notification.save();

      return {
        success: true,
        message: 'Payment success notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending payment success notification:', error);
      throw error;
    }
  }

  /**
   * Send payment failure notification
   */
  static async sendPaymentFailureNotification(transactionId: string, reason: string) {
    try {
      const Transaction = require('../models/Transaction').default;
      const transaction = await Transaction.findById(transactionId)
        .populate('userId', 'name email phone')
        .populate('messId', 'name');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const populatedTransaction = transaction as any;

      const notification = new Notification({
        userId: transaction.userId,
        messId: transaction.messId,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Your payment of ₹${transaction.amount} for ${populatedTransaction.messId?.name} failed. Reason: ${reason}. Please try again.`,
        status: 'completed',
        data: {
          transactionId: transaction._id,
          amount: transaction.amount,
          method: transaction.paymentMethod,
          reason
        },
        isRead: false
      });

      await notification.save();

      return {
        success: true,
        message: 'Payment failure notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
      throw error;
    }
  }

  // Subscription notification methods removed

  /**
   * Send billing generated notification
   */
  static async sendBillingGeneratedNotification(billingId: string) {
    try {
      const billing = await Billing.findById(billingId)
        .populate('userId', 'name email phone')
        .populate('messId', 'name');

      if (!billing) {
        throw new Error('Billing record not found');
      }

      const populatedBilling = billing as any;

      const notification = new Notification({
        userId: billing.userId,
        messId: billing.messId,
        type: 'billing_generated',
        title: 'New Bill Generated',
        message: `Your bill of ₹${billing.subscription.totalAmount} for ${populatedBilling.messId?.name} has been generated.`,
        status: 'completed',
        data: {
          billingId: billing._id,
          amount: billing.subscription.totalAmount,
          dueDate: billing.payment.dueDate,
          period: `${billing.billingPeriod.startDate.toISOString().split('T')[0]} to ${billing.billingPeriod.endDate.toISOString().split('T')[0]}`
        },
        isRead: false
      });

      await notification.save();

      return {
        success: true,
        message: 'Billing generated notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending billing generated notification:', error);
      throw error;
    }
  }

  /**
   * Send refund processed notification
   */
  static async sendRefundProcessedNotification(transactionId: string, refundAmount: number) {
    try {
      const Transaction = require('../models/Transaction').default;
      const transaction = await Transaction.findById(transactionId)
        .populate('userId', 'name email phone')
        .populate('messId', 'name');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const populatedTransaction = transaction as any;

      const notification = new Notification({
        userId: transaction.userId,
        messId: transaction.messId,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Your refund of ₹${refundAmount} for ${populatedTransaction.messId?.name} has been processed successfully.`,
        status: 'completed',
        data: {
          transactionId: transaction._id,
          refundAmount,
          originalAmount: transaction.amount
        },
        isRead: false
      });

      await notification.save();

      return {
        success: true,
        message: 'Refund processed notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending refund processed notification:', error);
      throw error;
    }
  }

  /**
   * Send bulk payment reminders
   */
  static async sendBulkPaymentReminders(membershipIds: string[]) {
    try {
      const memberships = await MessMembership.find({
        _id: { $in: membershipIds }
      }).populate('userId', 'name email phone').populate('messId', 'name');

      let successCount = 0;
      let errorCount = 0;

      for (const membership of memberships) {
        try {
          const populatedMembership = membership as any;
          const daysOverdue = membership.paymentDueDate 
            ? Math.floor((new Date().getTime() - membership.paymentDueDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          const notification = new Notification({
            userId: membership.userId,
            messId: membership.messId,
            type: 'payment_reminder',
            title: 'Payment Reminder',
            message: `Your payment of ₹${membership.paymentAmount} for ${populatedMembership.messId?.name} is ${daysOverdue > 0 ? `${daysOverdue} days overdue` : 'due soon'}. Please make the payment to avoid service suspension.`,
            status: 'completed',
            data: {
              membershipId: membership._id,
              amount: membership.paymentAmount,
              dueDate: membership.paymentDueDate,
              daysOverdue
            },
            isRead: false
          });

          await notification.save();
          successCount++;
        } catch (error) {
          console.error(`Error sending reminder for membership ${membership._id}:`, error);
          errorCount++;
        }
      }

      return {
        success: true,
        message: `Bulk reminders sent: ${successCount} successful, ${errorCount} failed`,
        data: {
          successCount,
          errorCount,
          totalCount: membershipIds.length
        }
      };
    } catch (error) {
      console.error('Error sending bulk payment reminders:', error);
      throw error;
    }
  }

  /**
   * Process all due notifications
   */
  static async processDueNotifications() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Find bills due tomorrow
      const billsDueTomorrow = await Billing.find({
        'payment.status': 'pending',
        'payment.dueDate': {
          $gte: now,
          $lte: tomorrow
        }
      });

      // Find overdue bills
      const overdueBills = await Billing.find({
        'payment.status': 'pending',
        'payment.dueDate': { $lt: now }
      });

      // Send notifications
      let notificationCount = 0;

      for (const bill of billsDueTomorrow) {
        await this.sendPaymentDueReminder(bill._id.toString());
        notificationCount++;
      }

      for (const bill of overdueBills) {
        await this.sendPaymentOverdueNotification(bill._id.toString());
        notificationCount++;
      }

      return {
        success: true,
        message: `Processed ${notificationCount} due notifications`,
        data: {
          billsDueTomorrow: billsDueTomorrow.length,
          overdueBills: overdueBills.length,
          notificationsSent: notificationCount
        }
      };
    } catch (error) {
      console.error('Error processing due notifications:', error);
      throw error;
    }
  }
}

export default BillingNotificationService;
