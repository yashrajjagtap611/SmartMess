import Otp from '../models/Otp';
import logger from './logger';

/**
 * Clean up expired OTPs from the database
 * This function should be called periodically (e.g., every 10 minutes)
 */
export async function cleanupExpiredOtps(): Promise<void> {
  try {
    const now = new Date();
    const result = await Otp.deleteMany({
      expiresAt: { $lt: now }
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} expired OTPs`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired OTPs:', error);
  }
}

/**
 * Clean up used/verified OTPs that are older than 1 hour
 * This helps keep the database clean
 */
export async function cleanupUsedOtps(): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await Otp.deleteMany({
      verified: true,
      createdAt: { $lt: oneHourAgo }
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} used OTPs`);
    }
  } catch (error) {
    logger.error('Error cleaning up used OTPs:', error);
  }
}

/**
 * Clean up invalidated OTPs that are older than 1 hour
 */
export async function cleanupInvalidatedOtps(): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await Otp.deleteMany({
      invalidated: true,
      createdAt: { $lt: oneHourAgo }
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} invalidated OTPs`);
    }
  } catch (error) {
    logger.error('Error cleaning up invalidated OTPs:', error);
  }
}

/**
 * Comprehensive cleanup function that runs all cleanup operations
 */
export async function runOtpCleanup(): Promise<void> {
  try {
    await Promise.all([
      cleanupExpiredOtps(),
      cleanupUsedOtps(),
      cleanupInvalidatedOtps()
    ]);
  } catch (error) {
    logger.error('Error running OTP cleanup:', error);
  }
} 