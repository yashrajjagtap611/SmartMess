import mongoose from 'mongoose';
import { AdCredit } from '../models';
import logger from '../utils/logger';

export class AdCreditService {
  /**
   * Initialize ad credits for a mess
   */
  static async initializeAdCredits(messId: string): Promise<any> {
    try {
      let adCredits = await AdCredit.findOne({ messId });
      
      if (!adCredits) {
        adCredits = await AdCredit.create({
          messId,
          totalCredits: 0,
          usedCredits: 0,
          availableCredits: 0
        });
        logger.info(`Initialized ad credits for mess ${messId}`);
      }
      
      return adCredits;
    } catch (error: any) {
      logger.error(`Error initializing ad credits: ${error.message}`);
      throw error;
    }
  }

  /**
   * Purchase ad credits
   */
  static async purchaseCredits(
    messId: string, 
    amount: number, 
    paymentReference?: string
  ): Promise<any> {
    try {
      let adCredits = await AdCredit.findOne({ messId });
      
      if (!adCredits) {
        adCredits = await this.initializeAdCredits(messId);
      }
      
      if (!adCredits) {
        throw new Error('Failed to initialize ad credits');
      }
      
      // Add credits
      await adCredits.addCredits(amount);
      
      logger.info(`Added ${amount} ad credits to mess ${messId}`);
      
      return adCredits;
    } catch (error: any) {
      logger.error(`Error purchasing ad credits: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deduct ad credits
   */
  static async deductCredits(
    messId: string, 
    amount: number, 
    description?: string
  ): Promise<any> {
    try {
      const adCredits = await AdCredit.findOne({ messId });
      
      if (!adCredits) {
        throw new Error('Ad credits account not found');
      }
      
      // Deduct credits
      await adCredits.deductCredits(amount);
      
      logger.info(`Deducted ${amount} ad credits from mess ${messId}: ${description || ''}`);
      
      return adCredits;
    } catch (error: any) {
      logger.error(`Error deducting ad credits: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get ad credits balance
   */
  static async getCredits(messId: string): Promise<any> {
    try {
      let adCredits = await AdCredit.findOne({ messId });
      
      if (!adCredits) {
        adCredits = await this.initializeAdCredits(messId);
      }
      
      return adCredits;
    } catch (error: any) {
      logger.error(`Error getting ad credits: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if mess has sufficient credits
   */
  static async hasSufficientCredits(messId: string, amount: number): Promise<boolean> {
    try {
      const adCredits = await this.getCredits(messId);
      return adCredits.availableCredits >= amount;
    } catch (error: any) {
      logger.error(`Error checking credits: ${error.message}`);
      return false;
    }
  }
}

