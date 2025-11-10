import mongoose from 'mongoose';
import {
  CreditSlab,
  CreditPurchasePlan,
  MessCredits,
  CreditTransaction,
  FreeTrialSettings,
  MessProfile,
  MessMembership
} from '../models';

export class CreditManagementService {
  // Credit Slab Management
  async createCreditSlab(data: {
    minUsers: number;
    maxUsers: number;
    creditsPerUser: number;
    createdBy: string;
  }) {
    // Check for overlapping slabs
    const existingSlab = await CreditSlab.findOne({
      $or: [
        { minUsers: { $lte: data.maxUsers }, maxUsers: { $gte: data.minUsers } }
      ],
      isActive: true
    });

    if (existingSlab) {
      throw new Error('Credit slab range overlaps with existing slab');
    }

    return await CreditSlab.create({
      ...data,
      updatedBy: data.createdBy
    });
  }

  async updateCreditSlab(slabId: string, data: {
    minUsers?: number;
    maxUsers?: number;
    creditsPerUser?: number;
    isActive?: boolean;
    updatedBy: string;
  }) {
    const slab = await CreditSlab.findById(slabId);
    if (!slab) {
      throw new Error('Credit slab not found');
    }

    // Check for overlapping slabs if range is being updated
    if (data.minUsers || data.maxUsers) {
      const minUsers = data.minUsers || slab.minUsers;
      const maxUsers = data.maxUsers || slab.maxUsers;

      const existingSlab = await CreditSlab.findOne({
        _id: { $ne: slabId },
        $or: [
          { minUsers: { $lte: maxUsers }, maxUsers: { $gte: minUsers } }
        ],
        isActive: true
      });

      if (existingSlab) {
        throw new Error('Credit slab range overlaps with existing slab');
      }
    }

    return await CreditSlab.findByIdAndUpdate(slabId, data, { new: true });
  }

  async getCreditSlabs(filters: { isActive?: boolean } = {}) {
    return await CreditSlab.find(filters)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ minUsers: 1 });
  }

  async deleteCreditSlab(slabId: string) {
    return await CreditSlab.findByIdAndUpdate(
      slabId,
      { isActive: false },
      { new: true }
    );
  }

  // Credit Purchase Plan Management
  async createCreditPurchasePlan(data: {
    name: string;
    description: string;
    baseCredits: number;
    bonusCredits?: number;
    price: number;
    currency?: string;
    isPopular?: boolean;
    features?: string[];
    validityDays?: number;
    createdBy: string;
  }) {
    return await CreditPurchasePlan.create({
      ...data,
      updatedBy: data.createdBy
    });
  }

  async updateCreditPurchasePlan(planId: string, data: {
    name?: string;
    description?: string;
    baseCredits?: number;
    bonusCredits?: number;
    price?: number;
    isActive?: boolean;
    isPopular?: boolean;
    features?: string[];
    validityDays?: number;
    updatedBy: string;
  }) {
    return await CreditPurchasePlan.findByIdAndUpdate(planId, data, { new: true });
  }

  async getCreditPurchasePlans(filters: { isActive?: boolean; isPopular?: boolean } = {}) {
    return await CreditPurchasePlan.find(filters)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ price: 1 });
  }

  async deleteCreditPurchasePlan(planId: string) {
    return await CreditPurchasePlan.findByIdAndUpdate(
      planId,
      { isActive: false },
      { new: true }
    );
  }

  // Mess Credits Management
  async initializeMessCredits(messId: string, options: {
    startTrial?: boolean;
    initialCredits?: number;
  } = {}) {
    const existingCredits = await MessCredits.findOne({ messId });
    if (existingCredits) {
      return existingCredits;
    }

    let trialSettings = await FreeTrialSettings.findOne();
    if (!trialSettings) {
      trialSettings = await FreeTrialSettings.create({
        isGloballyEnabled: true,
        defaultTrialDurationDays: 7,
        trialCredits: 100,
        allowedFeatures: ['basic_features'],
        restrictedFeatures: ['premium_analytics'],
        maxTrialsPerMess: 1,
        cooldownPeriodDays: 30,
        autoActivateOnRegistration: true,
        requiresApproval: false,
        notificationSettings: {
          sendWelcomeEmail: true,
          sendReminderEmails: true,
          reminderDays: [3, 1],
          sendExpiryNotification: true
        },
        updatedBy: new mongoose.Types.ObjectId()
      });
    }
    const isTrialActive = options.startTrial !== false && trialSettings.isGloballyEnabled;

    const messCredits = await MessCredits.create({
      messId,
      totalCredits: options.initialCredits || 0,
      isTrialActive,
      trialStartDate: isTrialActive ? new Date() : null,
      trialEndDate: isTrialActive 
        ? new Date(Date.now() + trialSettings.defaultTrialDurationDays * 24 * 60 * 60 * 1000)
        : null,
      status: isTrialActive ? 'trial' : 'active'
    });

    if (isTrialActive) {
      await CreditTransaction.create({
        messId,
        type: 'trial',
        amount: trialSettings.trialCredits,
        description: `Free trial activated - ${trialSettings.defaultTrialDurationDays} days`,
        status: 'completed'
      });
    }

    return messCredits;
  }

  async purchaseCredits(messId: string, planId: string, paymentReference?: string) {
    const plan = await CreditPurchasePlan.findById(planId);
    if (!plan || !plan.isActive) {
      throw new Error('Invalid or inactive credit plan');
    }

    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    // Add credits
    // @ts-ignore - Custom instance method
    await messCredits.addCredits(plan.totalCredits);

    // Create transaction record
    await CreditTransaction.create({
      messId,
      planId,
      type: 'purchase',
      amount: plan.totalCredits,
      description: `Credit purchase - ${plan.name}`,
      referenceId: paymentReference,
      status: 'completed'
    });

    // Update status if was expired
    if (messCredits.status === 'expired') {
      messCredits.status = 'active';
      await messCredits.save();
    }

    return messCredits;
  }

  async deductCredits(messId: string, amount: number, description: string, metadata?: any) {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    // @ts-ignore - Custom instance method
    if (!messCredits.canAccessPaidFeatures()) {
      throw new Error('Insufficient credits or trial expired');
    }

    // @ts-ignore - Custom instance method
    await messCredits.deductCredits(amount);

    await CreditTransaction.create({
      messId,
      type: 'deduction',
      amount: -amount,
      description,
      metadata,
      status: 'completed'
    });

    return messCredits;
  }

  async adjustCredits(messId: string, amount: number, description: string, processedBy: string) {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    if (amount > 0) {
      // @ts-ignore - Custom instance method
      await messCredits.addCredits(amount);
    } else {
      // @ts-ignore - Custom instance method
      await messCredits.deductCredits(Math.abs(amount));
    }

    await CreditTransaction.create({
      messId,
      type: 'adjustment',
      amount,
      description,
      processedBy,
      status: 'completed'
    });

    return messCredits;
  }

  // Monthly Billing Automation removed

  // Free Trial Management
  async getFreeTrialSettings() {
    // @ts-ignore - Custom static method
    return await FreeTrialSettings.getCurrentSettings();
  }

  async updateFreeTrialSettings(updates: any, updatedBy: string) {
    // @ts-ignore - Custom static method
    return await FreeTrialSettings.updateSettings(updates, updatedBy);
  }

  async activateFreeTrial(messId: string) {
    // @ts-ignore - Custom static method
    const settings = await FreeTrialSettings.getCurrentSettings();
    if (!settings.isGloballyEnabled) {
      throw new Error('Free trials are currently disabled');
    }

    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      throw new Error('Mess credits account not found');
    }

    if (messCredits.isTrialActive) {
      throw new Error('Trial is already active');
    }

    // Check trial eligibility
    const previousTrials = await CreditTransaction.countDocuments({
      messId,
      type: 'trial'
    });

    if (previousTrials >= settings.maxTrialsPerMess) {
      throw new Error('Maximum trial limit reached');
    }

    // Activate trial
    messCredits.isTrialActive = true;
    messCredits.trialStartDate = new Date();
    messCredits.trialEndDate = new Date(Date.now() + settings.defaultTrialDurationDays * 24 * 60 * 60 * 1000);
    messCredits.status = 'trial';
    await messCredits.save();

    // Create transaction
    await CreditTransaction.create({
      messId,
      type: 'trial',
      amount: settings.trialCredits,
      description: `Free trial activated - ${settings.defaultTrialDurationDays} days`,
      status: 'completed'
    });

    return messCredits;
  }

  // Utility methods
  async getMessCreditsDetails(messId: string) {
    const messCredits = await MessCredits.findOne({ messId });
    if (!messCredits) {
      return null;
    }

    const transactions = await CreditTransaction.find({ messId })
      .populate('planId', 'name baseCredits bonusCredits price')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    return {
      credits: messCredits,
      recentTransactions: transactions,
      nextBilling: null
    };
  }

  // Notification helpers removed with automation
}

export const creditManagementService = new CreditManagementService();
