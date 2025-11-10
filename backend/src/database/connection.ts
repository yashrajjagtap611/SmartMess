import mongoose from 'mongoose';
import logger from '../utils/logger';
import { CONFIG } from '../constants';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      const mongoUri = process.env['MONGODB_URI'];
      if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      const options = {
        maxPoolSize: CONFIG.DATABASE.MAX_POOL_SIZE,
        serverSelectionTimeoutMS: CONFIG.DATABASE.CONNECTION_TIMEOUT,
        socketTimeoutMS: CONFIG.DATABASE.CONNECTION_TIMEOUT,
        bufferCommands: false,
      };

      await mongoose.connect(mongoUri, options);
      this.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info('Database already disconnected');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Database disconnection failed:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      
      const admin = mongoose.connection.db.admin();
      await admin.ping();
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

export const databaseConnection = DatabaseConnection.getInstance(); 