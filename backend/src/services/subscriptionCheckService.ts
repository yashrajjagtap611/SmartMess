import { MessCredits, FreeTrialSettings } from '../models';
import logger from '../utils/logger';

export interface SubscriptionStatus {
  isActive: boolean;
  isTrialActive: boolean;
  isExpired: boolean;
  hasCredits: boolean;
  availableCredits: number;
  message?: string;
}

export class SubscriptionCheckService {
  /**
   * Check if a mess has active subscription (trial or paid)
   */
  async checkSubscriptionStatus(messId: string): Promise<SubscriptionStatus> {
    try {
      // Get mess credits
      let messCredits = await MessCredits.findOne({ messId });

      // If no credits record exists, create one with trial if enabled
      if (!messCredits) {
        const trialSettings = await FreeTrialSettings.findOne();
        const isTrialEnabled = trialSettings?.isGloballyEnabled || false;

        messCredits = await MessCredits.create({
          messId,
          totalCredits: 0,
          usedCredits: 0,
          availableCredits: 0,
          isTrialActive: isTrialEnabled,
          trialStartDate: isTrialEnabled ? new Date() : undefined,
          trialEndDate: isTrialEnabled && trialSettings?.defaultTrialDurationDays
            ? new Date(Date.now() + trialSettings.defaultTrialDurationDays * 24 * 60 * 60 * 1000)
            : undefined,
          trialCreditsUsed: 0,
          monthlyUserCount: 0,
          lastUserCountUpdate: new Date(),
          status: isTrialEnabled ? 'trial' : 'suspended',
          autoRenewal: false,
          lowCreditThreshold: 100
        });

        logger.info(`Created default credits account for mess ${messId} with trial: ${isTrialEnabled}`);
      }

      const now = new Date();
      const isTrialActive = Boolean(
        messCredits.isTrialActive && 
        messCredits.trialEndDate && 
        now < messCredits.trialEndDate
      );
      
      const hasCredits = messCredits.availableCredits > 0;
      
      // Check if bill has been paid recently (within current billing period)
      // If status is 'active' and they have a lastBillingDate, they've paid their bill
      // Also check if nextBillingDate hasn't passed yet (they're still in paid period)
      // OR if lastBillingDate is within the last 30 days (reasonable billing period)
      const hasPaidBill = messCredits.status === 'active' && 
        messCredits.lastBillingDate && 
        messCredits.lastBillingDate instanceof Date;
      
      let isInPaidPeriod = false;
      if (hasPaidBill && messCredits.lastBillingDate) {
        // Check if nextBillingDate hasn't passed yet
        if (messCredits.nextBillingDate && now < messCredits.nextBillingDate) {
          isInPaidPeriod = true;
        } 
        // If nextBillingDate is not set, check if lastBillingDate is within last 30 days
        else if (!messCredits.nextBillingDate) {
          const daysSinceLastBilling = (now.getTime() - messCredits.lastBillingDate.getTime()) / (1000 * 60 * 60 * 24);
          isInPaidPeriod = daysSinceLastBilling <= 30;
        }
      }
      
      // Subscription is active if:
      // 1. Trial is active, OR
      // 2. Has credits, OR
      // 3. Has paid bill and is still in paid period (even if credits are zero)
      const isActive = isTrialActive || hasCredits || isInPaidPeriod;
      const isExpired = !isActive;

      // Log subscription status for debugging
      if (isInPaidPeriod && !hasCredits) {
        logger.info(`Mess ${messId} has paid bill but zero credits - allowing access (lastBillingDate: ${messCredits.lastBillingDate}, nextBillingDate: ${messCredits.nextBillingDate})`);
      }

      let message = '';
      if (isExpired) {
        message = 'Your subscription has expired. Please go to the Subscription section and pay the bill to continue using the platform.';
      }

      return {
        isActive,
        isTrialActive,
        isExpired,
        hasCredits,
        availableCredits: messCredits.availableCredits,
        message
      };
    } catch (error) {
      logger.error(`Failed to check subscription status for mess ${messId}:`, error);
      throw error;
    }
  }

  /**
   * Check if mess can accept new users
   */
  async canAcceptNewUsers(messId: string): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.checkSubscriptionStatus(messId);
    
    if (!status.isActive) {
      return {
        allowed: false,
        reason: status.message || 'Subscription expired'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if mess can add meals
   */
  async canAddMeals(messId: string): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.checkSubscriptionStatus(messId);
    
    if (!status.isActive) {
      return {
        allowed: false,
        reason: status.message || 'Subscription expired'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if mess can access a specific module
   */
  async canAccessModule(messId: string, module: string): Promise<{ allowed: boolean; reason?: string }> {
    const restrictedModules = [
      'billing',
      'user-management',
      'meal-management',
      'chat',
      'feedback',
      'leave-management'
    ];

    // Subscription module is always accessible
    if (module === 'subscription' || module === 'platform-subscription') {
      return { allowed: true };
    }

    // Check if module is restricted
    if (restrictedModules.includes(module.toLowerCase())) {
      const status = await this.checkSubscriptionStatus(messId);
      
      if (!status.isActive) {
        return {
          allowed: false,
          reason: status.message || 'Subscription expired'
        };
      }
    }

    return { allowed: true };
  }
}

export const subscriptionCheckService = new SubscriptionCheckService();

