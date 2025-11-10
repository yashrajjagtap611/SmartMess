import mongoose from 'mongoose';
import {
  CreditSlab,
  MessCredits,
  CreditTransaction,
  MessMembership,
  FreeTrialSettings,
  MessProfile
} from '../models';
import logger from '../utils/logger';

export class MessBillingService {
  /**
   * Calculate tiered credits based on user count across all active slabs
   */
  async calculateTieredCredits(userCount: number): Promise<{
    totalCredits: number;
    breakdown: Array<{ minUsers: number; maxUsers: number; users: number; creditsPerUser: number; subtotal: number }>;
  }> {
    if (userCount <= 0) {
      return { totalCredits: 0, breakdown: [] };
    }

    // Get all active slabs sorted by minUsers
    const slabs = await CreditSlab.find({ isActive: true }).sort({ minUsers: 1 });
    
    if (slabs.length === 0) {
      throw new Error('No active credit slabs found. Please contact admin.');
    }

    let totalCredits = 0;
    const breakdown: Array<{ minUsers: number; maxUsers: number; users: number; creditsPerUser: number; subtotal: number }> = [];

    for (const slab of slabs) {
      if (userCount < slab.minUsers) break;
      
      const rangeEnd = Math.min(userCount, slab.maxUsers);
      const usersInRange = rangeEnd - slab.minUsers + 1;
      
      if (usersInRange > 0) {
        const subtotal = usersInRange * slab.creditsPerUser;
        totalCredits += subtotal;
        
        breakdown.push({
          minUsers: slab.minUsers,
          maxUsers: slab.maxUsers,
          users: usersInRange,
          creditsPerUser: slab.creditsPerUser,
          subtotal
        });
      }
    }

    return { totalCredits, breakdown };
  }

  /**
   * Get current active user count for a mess
   */
  async getActiveUserCount(messId: string): Promise<number> {
    return await MessMembership.countDocuments({
      messId,
      status: 'active'
    });
  }

  /**
   * Calculate monthly bill for a mess
   * IMPORTANT: This calculates based on CURRENT active user count.
   * Monthly bill charges for all current active users at billing time.
   */
  async calculateMonthlyBill(messId: string): Promise<{
    messId: string;
    userCount: number;
    totalCredits: number;
    breakdown: any[];
    canAfford: boolean;
    availableCredits: number;
  }> {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    // Get current active user count (all users active at billing time)
    const currentUserCount = await this.getActiveUserCount(messId);
    
    // Calculate bill for all current active users
    const { totalCredits, breakdown } = await this.calculateTieredCredits(currentUserCount);

    return {
      messId,
      userCount: currentUserCount,
      totalCredits,
      breakdown,
      canAfford: messCredits.availableCredits >= totalCredits,
      availableCredits: messCredits.availableCredits
    };
  }

  /**
   * Get comprehensive billing details for a mess (for frontend dashboard)
   */
  async getBillingDetails(messId: string): Promise<{
    credits: any;
    recentTransactions: any[];
    currentUserCount: number;
    nextBillingAmount: number;
  }> {
    // Try to find existing credits account
    let messCredits = await MessCredits.findOne({ messId });
    
    // If no credits account exists, create a default one WITHOUT trial (trial must be activated manually)
    if (!messCredits) {
      logger.info(`Creating default credits account for mess ${messId} without trial`);
      
      messCredits = await MessCredits.create({
        messId,
        totalCredits: 0,
        usedCredits: 0,
        availableCredits: 0,
        isTrialActive: false, // Trial must be manually activated
        trialStartDate: undefined,
        trialEndDate: undefined,
        trialCreditsUsed: 0,
        monthlyUserCount: 0,
        lastUserCountUpdate: new Date(),
        status: 'suspended', // Suspended until trial is activated or credits purchased
        autoRenewal: false,
        lowCreditThreshold: 100
      });
      
      logger.info(`Default credits account created for mess ${messId} - trial must be manually activated`);
    }

    // Check if trial has expired and update status
    const now = new Date();
    if (messCredits.isTrialActive && messCredits.trialEndDate && now >= messCredits.trialEndDate) {
      // Trial has expired, update the database
      messCredits.isTrialActive = false;
      messCredits.status = messCredits.availableCredits > 0 ? 'active' : 'expired';
      await messCredits.save();
      logger.info(`Trial expired for mess ${messId}, updated status to ${messCredits.status}`);
    }

    // Get recent transactions
    const transactions = await CreditTransaction.find({ messId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate current user count
    const activeMembers = await this.getActiveUserCount(messId);

    // Calculate next billing amount (only if not in trial or trial expired)
    let nextBillingAmount = 0;
    try {
      const bill = await this.calculateMonthlyBill(messId);
      nextBillingAmount = bill.totalCredits;
    } catch (error) {
      logger.warn(`Failed to calculate billing amount for mess ${messId}:`, error);
      // Continue with 0 billing amount if calculation fails
    }

    return {
      credits: messCredits,
      recentTransactions: transactions,
      currentUserCount: activeMembers,
      nextBillingAmount
    };
  }

  /**
   * Generate and store pending bill (manual billing trigger)
   */
  async generatePendingBill(messId: string): Promise<{
    bill: any;
    messCredits: any;
  }> {
    const bill = await this.calculateMonthlyBill(messId);
    
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    // Update pending bill amount
    messCredits.pendingBillAmount = bill.totalCredits;
    messCredits.monthlyUserCount = bill.userCount;
    await messCredits.save();

    logger.info(`Pending bill generated for mess ${messId}: ${bill.totalCredits} credits`);

    return { bill, messCredits };
  }

  /**
   * Pay pending bill (mess owner manually pays)
   */
  async payPendingBill(messId: string): Promise<{
    success: boolean;
    messCredits: any;
    transaction: any;
  }> {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    if (!messCredits.pendingBillAmount || messCredits.pendingBillAmount <= 0) {
      throw new Error('No pending bill to pay');
    }

    if (messCredits.availableCredits < messCredits.pendingBillAmount) {
      throw new Error('Insufficient credits to pay bill');
    }

    // Deduct credits
    // @ts-ignore - Custom instance method
    await messCredits.deductCredits(messCredits.pendingBillAmount);

    // Create transaction record
    const transaction = await CreditTransaction.create({
      messId,
      type: 'deduction',
      amount: -messCredits.pendingBillAmount,
      description: `Monthly billing for ${messCredits.monthlyUserCount} users`,
      metadata: {
        userCount: messCredits.monthlyUserCount,
        billingPeriod: {
          startDate: messCredits.lastBillingDate || new Date(),
          endDate: new Date()
        }
      },
      status: 'completed'
    });

    // Get current active user count (for next billing cycle)
    const currentActiveUserCount = await this.getActiveUserCount(messId);

    // Update billing dates and clear pending
    messCredits.lastBillingDate = new Date();
    messCredits.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    messCredits.lastBillingAmount = messCredits.pendingBillAmount;
    messCredits.pendingBillAmount = 0;
    // IMPORTANT: Update monthlyUserCount to CURRENT user count for NEXT billing cycle
    messCredits.monthlyUserCount = currentActiveUserCount;
    messCredits.status = 'active';
    await messCredits.save();

    logger.info(`Bill paid for mess ${messId}: ${transaction.amount} credits`);

    return { success: true, messCredits, transaction };
  }

  /**
   * Process monthly bill (calculate and deduct immediately)
   */
  async processMessMonthlyBill(messId: string): Promise<{
    success: boolean;
    creditsDeducted: number;
    remainingCredits: number;
    message: string;
  }> {
    const bill = await this.calculateMonthlyBill(messId);
    
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    // During trial, no deduction
    if (messCredits.isTrialActive && messCredits.trialEndDate && new Date() < messCredits.trialEndDate) {
      return {
        success: false,
        creditsDeducted: 0,
        remainingCredits: messCredits.availableCredits,
        message: 'Cannot process bill during active trial period'
      };
    }

    if (messCredits.availableCredits < bill.totalCredits) {
      throw new Error(`Insufficient credits. Need ${bill.totalCredits}, have ${messCredits.availableCredits}`);
    }

    // Deduct credits
    // @ts-ignore - Custom instance method
    await messCredits.deductCredits(bill.totalCredits);

    // Create transaction
    await CreditTransaction.create({
      messId,
      type: 'deduction',
      amount: -bill.totalCredits,
      description: `Monthly billing: ${bill.breakdown.map((b: any) => `${b.users} users @ ${b.creditsPerUser} credits`).join('; ')}`,
      metadata: {
        breakdown: bill.breakdown,
        userCount: bill.userCount,
        billingPeriod: 'monthly'
      },
      status: 'completed'
    });

    // Get current active user count (for next billing cycle)
    const currentActiveUserCount = await this.getActiveUserCount(messId);

    // Update billing dates
    messCredits.lastBillingDate = new Date();
    messCredits.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    messCredits.lastBillingAmount = bill.totalCredits;
    // IMPORTANT: Update monthlyUserCount to CURRENT user count for NEXT billing cycle
    // This ensures the next monthly bill will charge for all users who are active now
    messCredits.monthlyUserCount = currentActiveUserCount;
    messCredits.status = 'active';
    await messCredits.save();

    logger.info(`Monthly bill processed for mess ${messId}: ${bill.totalCredits} credits deducted (charged for ${bill.userCount} current active users)`);

    // Check for low credits and send notifications
    try {
      await this.sendLowCreditNotification(messId);
      await this.sendCriticalCreditAlert(messId);
    } catch (notifError) {
      logger.error(`Failed to send credit notifications for mess ${messId}:`, notifError);
    }

    return {
      success: true,
      creditsDeducted: bill.totalCredits,
      remainingCredits: messCredits.availableCredits,
      message: `Monthly bill processed successfully. ${bill.totalCredits} credits deducted.`
    };
  }

  /**
   * Auto-deduct monthly credits (for messes with auto-renewal enabled)
   */
  async processAutoRenewal(messId: string): Promise<{
    success: boolean;
    message: string;
    messCredits?: any;
  }> {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      return { success: false, message: 'Mess credits account not found' };
    }

    if (!messCredits.autoRenewal) {
      return { success: false, message: 'Auto-renewal is not enabled' };
    }

    // Check if billing is due
    if (messCredits.nextBillingDate && new Date() < messCredits.nextBillingDate) {
      return { success: false, message: 'Billing not due yet' };
    }

    const bill = await this.calculateMonthlyBill(messId);

    if (messCredits.availableCredits < bill.totalCredits) {
      // Insufficient credits - suspend and notify
      messCredits.status = 'suspended';
      messCredits.pendingBillAmount = bill.totalCredits;
      await messCredits.save();

      logger.warn(`Auto-renewal failed for mess ${messId}: Insufficient credits`);

      return {
        success: false,
        message: 'Insufficient credits for auto-renewal',
        messCredits
      };
    }

    // Deduct credits
    // @ts-ignore - Custom instance method
    await messCredits.deductCredits(bill.totalCredits);

    // Create transaction
    await CreditTransaction.create({
      messId,
      type: 'deduction',
      amount: -bill.totalCredits,
      description: `Auto-renewal: Monthly billing for ${bill.userCount} users`,
      metadata: {
        userCount: bill.userCount,
        breakdown: bill.breakdown,
        billingPeriod: {
          startDate: messCredits.lastBillingDate || new Date(),
          endDate: new Date()
        }
      },
      status: 'completed'
    });

    // Get current active user count (for next billing cycle)
    const currentActiveUserCount = await this.getActiveUserCount(messId);

    // Update billing dates
    messCredits.lastBillingDate = new Date();
    messCredits.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    messCredits.lastBillingAmount = bill.totalCredits;
    // IMPORTANT: Update monthlyUserCount to CURRENT user count for NEXT billing cycle
    messCredits.monthlyUserCount = currentActiveUserCount;
    messCredits.status = 'active';
    await messCredits.save();

    logger.info(`Auto-renewal successful for mess ${messId}: ${bill.totalCredits} credits deducted (charged for ${bill.userCount} current active users)`);

    return { success: true, message: 'Auto-renewal successful', messCredits };
  }

  /**
   * Check if mess has sufficient credits for adding a new user
   */
  async checkCreditsSufficientForNewUser(messId: string): Promise<{
    sufficient: boolean;
    requiredCredits: number;
    availableCredits: number;
    currentUserCount: number;
    newUserCount: number;
  }> {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    // During trial, always allow
    if (messCredits.isTrialActive && !messCredits.isTrialExpired()) {
      return {
        sufficient: true,
        requiredCredits: 0,
        availableCredits: messCredits.availableCredits,
        currentUserCount: await this.getActiveUserCount(messId),
        newUserCount: await this.getActiveUserCount(messId) + 1
      };
    }

    const currentUserCount = await this.getActiveUserCount(messId);
    const newUserCount = currentUserCount + 1;

    // Calculate credits needed for new user count
    const currentBill = await this.calculateTieredCredits(currentUserCount);
    const newBill = await this.calculateTieredCredits(newUserCount);
    const additionalCredits = newBill.totalCredits - currentBill.totalCredits;

    return {
      sufficient: messCredits.availableCredits >= additionalCredits,
      requiredCredits: additionalCredits,
      availableCredits: messCredits.availableCredits,
      currentUserCount,
      newUserCount
    };
  }

  /**
   * Deduct credits when a new user is added
   */
  async deductCreditsForNewUser(messId: string, userId: string): Promise<{
    success: boolean;
    creditsDeducted: number;
    transaction: any;
  }> {
    const check = await this.checkCreditsSufficientForNewUser(messId);
    
    if (!check.sufficient) {
      throw new Error('Insufficient credits to add new user');
    }

    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    // During trial, no deduction
    if (messCredits.isTrialActive && !messCredits.isTrialExpired()) {
      return {
        success: true,
        creditsDeducted: 0,
        transaction: null
      };
    }

    // Deduct credits
    // @ts-ignore - Custom instance method
    await messCredits.deductCredits(check.requiredCredits);

    // Create transaction
    const transaction = await CreditTransaction.create({
      messId,
      type: 'deduction',
      amount: -check.requiredCredits,
      description: `User added: Credits for user count ${check.currentUserCount} → ${check.newUserCount} (immediate charge)`,
      metadata: {
        userId,
        previousUserCount: check.currentUserCount,
        newUserCount: check.newUserCount,
        isImmediateCharge: true // Mark as immediate charge (not monthly bill)
      },
      status: 'completed'
    });

    // IMPORTANT: Do NOT update monthlyUserCount here!
    // monthlyUserCount represents users at START of billing cycle.
    // It should only be updated when monthly bill is paid.
    // This ensures users who joined during the cycle are not charged again in monthly bill.
    // await messCredits.save(); // Not needed since we're not updating any fields

    logger.info(`Credits deducted for new user in mess ${messId}: ${check.requiredCredits} credits`);

    // Check if credits are low and send notifications
    try {
      await this.sendLowCreditNotification(messId);
      await this.sendCriticalCreditAlert(messId);
    } catch (notifError) {
      logger.error(`Failed to send credit notifications for mess ${messId}:`, notifError);
      // Don't fail the transaction
    }

    return {
      success: true,
      creditsDeducted: check.requiredCredits,
      transaction
    };
  }

  /**
   * Check for low credits and return warning
   */
  async checkLowCredits(messId: string): Promise<{
    isLow: boolean;
    availableCredits: number;
    threshold: number;
    estimatedMonthsRemaining: number;
  }> {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    const bill = await this.calculateMonthlyBill(messId);
    const estimatedMonthsRemaining = bill.totalCredits > 0 
      ? Math.floor(messCredits.availableCredits / bill.totalCredits)
      : Infinity;

    return {
      isLow: messCredits.availableCredits < messCredits.lowCreditThreshold,
      availableCredits: messCredits.availableCredits,
      threshold: messCredits.lowCreditThreshold,
      estimatedMonthsRemaining
    };
  }

  /**
   * Send low credit notification to mess owner
   */
  async sendLowCreditNotification(messId: string): Promise<void> {
    try {
      const messProfile = await MessProfile.findById(messId);
      if (!messProfile) {
        throw new Error('Mess profile not found');
      }

      const messCredits = await MessCredits.findOne({ messId });
      if (!messCredits) {
        throw new Error('Mess credits account not found');
      }

      const lowCreditCheck = await this.checkLowCredits(messId);
      if (!lowCreditCheck.isLow) {
        return; // No need to send notification
      }

      const Notification = require('../models/Notification').default;
      
      // Check if we already sent a low credit notification recently (within last 24 hours)
      const recentNotification = await Notification.findOne({
        userId: messProfile.userId,
        messId,
        type: 'low_credit_warning',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (recentNotification) {
        logger.info(`Low credit notification already sent recently for mess ${messId}`);
        return;
      }

      const notification = new Notification({
        userId: messProfile.userId,
        messId,
        type: 'low_credit_warning',
        title: 'Low Credit Balance',
        message: `Your credit balance (${lowCreditCheck.availableCredits} credits) is below the threshold (${lowCreditCheck.threshold} credits). You have approximately ${lowCreditCheck.estimatedMonthsRemaining} month(s) of service remaining. Please purchase more credits to avoid service interruption.`,
        status: 'pending',
        data: {
          availableCredits: lowCreditCheck.availableCredits,
          threshold: lowCreditCheck.threshold,
          estimatedMonthsRemaining: lowCreditCheck.estimatedMonthsRemaining,
          redirectTo: '/mess-owner/platform-subscription'
        },
        isRead: false
      });

      await notification.save();
      logger.info(`Low credit notification sent to mess owner for mess ${messId}`);
    } catch (error) {
      logger.error(`Failed to send low credit notification for mess ${messId}:`, error);
      throw error;
    }
  }

  /**
   * Send critical credit alert (when credits are critically low or exhausted)
   */
  async sendCriticalCreditAlert(messId: string): Promise<void> {
    try {
      const messProfile = await MessProfile.findById(messId);
      if (!messProfile) {
        throw new Error('Mess profile not found');
      }

      const messCredits = await MessCredits.findOne({ messId });
      if (!messCredits) {
        throw new Error('Mess credits account not found');
      }

      // Only send if credits are below 20% of threshold or zero
      const criticalThreshold = messCredits.lowCreditThreshold * 0.2;
      if (messCredits.availableCredits > criticalThreshold) {
        return;
      }

      const Notification = require('../models/Notification').default;
      
      // Check if we already sent a critical alert recently (within last 12 hours)
      const recentAlert = await Notification.findOne({
        userId: messProfile.userId,
        messId,
        type: 'critical_credit_alert',
        createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }
      });

      if (recentAlert) {
        logger.info(`Critical credit alert already sent recently for mess ${messId}`);
        return;
      }

      const message = messCredits.availableCredits === 0
        ? 'Your credit balance is zero! You cannot accept new user requests until you purchase more credits.'
        : `URGENT: Your credit balance (${messCredits.availableCredits} credits) is critically low! Service may be interrupted. Please purchase credits immediately.`;

      const notification = new Notification({
        userId: messProfile.userId,
        messId,
        type: 'critical_credit_alert',
        title: messCredits.availableCredits === 0 ? 'Credit Balance Exhausted' : 'Critical: Low Credit Balance',
        message,
        status: 'pending',
        priority: 'high',
        data: {
          availableCredits: messCredits.availableCredits,
          threshold: messCredits.lowCreditThreshold,
          redirectTo: '/mess-owner/platform-subscription'
        },
        isRead: false
      });

      await notification.save();
      logger.info(`Critical credit alert sent to mess owner for mess ${messId}`);
    } catch (error) {
      logger.error(`Failed to send critical credit alert for mess ${messId}:`, error);
      throw error;
    }
  }

  /**
   * Get billing history for a mess
   */
  async getBillingHistory(messId: string, options: {
    page?: number;
    limit?: number;
    type?: string;
  } = {}): Promise<{
    transactions: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = { messId, status: 'completed' };
    if (options.type) {
      filter.type = options.type;
    }

    const [transactions, total] = await Promise.all([
      CreditTransaction.find(filter)
        .populate('planId', 'name baseCredits bonusCredits price')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CreditTransaction.countDocuments(filter)
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get credit usage report
   */
  async getCreditUsageReport(messId: string, options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{
    totalCreditsAdded: number;
    totalCreditsUsed: number;
    currentBalance: number;
    transactionSummary: any;
  }> {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    const filter: any = { messId, status: 'completed' };
    
    if (options.startDate || options.endDate) {
      filter.createdAt = {};
      if (options.startDate) filter.createdAt.$gte = options.startDate;
      if (options.endDate) filter.createdAt.$lte = options.endDate;
    }

    const transactionSummary = await CreditTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCreditsAdded = transactionSummary
      .filter(t => ['purchase', 'bonus', 'trial', 'adjustment'].includes(t._id) && t.totalAmount > 0)
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalCreditsUsed = Math.abs(transactionSummary
      .filter(t => t._id === 'deduction')
      .reduce((sum, t) => sum + t.totalAmount, 0));

    return {
      totalCreditsAdded,
      totalCreditsUsed,
      currentBalance: messCredits.availableCredits,
      transactionSummary
    };
  }
}

export const messBillingService = new MessBillingService();

