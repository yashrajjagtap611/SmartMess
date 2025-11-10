// Database Configuration
// Centralized database connection and configuration settings

import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env['MONGODB_URI'];
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri, {
      // MongoDB connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    logger.info('✅ Database connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('❌ Database connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Database disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 Database reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('Database connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error during database shutdown:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}; 