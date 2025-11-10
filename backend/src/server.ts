import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';

// Import configuration and utilities
import config from './config';
import logger from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { 
  securityMiddleware, 
  generalRateLimiter
} from './middleware/security';
import { runOtpCleanup } from './utils/otpCleanup';

// Register models so mongoose.model(name) is available across modules
import './models/MessLeave';
import './models/BillingAdjustment';
import './models/MessOffDay';
import './models/DefaultOffDaySettings';
import './models/ChatRoom';
import './models/ChatMessage';
import './models/ChatNotification';

// Import routes
import routes from './routes';
import WebSocketService from './services/websocketService';
// Removed monthly billing automation

const app: express.Application = express();
const server = createServer(app);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(securityMiddleware);

// Rate limiting
app.use(generalRateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://[::1]:5173',
    'http://[::1]:3000',
    'https://smart-mess-ten.vercel.app',
    'https://smart-mess-ten.vercel.app/',
    config.frontendUrl
  ].filter(Boolean); // Remove any undefined values
  
  // Normalize origin by removing trailing slash for comparison
  const normalizedOrigin = origin ? origin.replace(/\/+$/, '') : null;
  const normalizedAllowedOrigins = allowedOrigins.map(o => String(o).replace(/\/+$/, ''));
  
  if (normalizedOrigin && normalizedAllowedOrigins.includes(normalizedOrigin)) {
    res.header('Access-Control-Allow-Origin', origin!);
  } else if (config.frontendUrl) {
    res.header('Access-Control-Allow-Origin', config.frontendUrl);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SmartMess API is running',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    environment: config.env
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.uri, {
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

    // Start OTP cleanup job
    runOtpCleanup();

    // Initialize WebSocket service
    const wsService = new WebSocketService(server);
    
    // Export for use in other modules
    (global as any).websocketService = wsService;

    // Start the server
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📱 Frontend URL: ${config.frontendUrl}`);
      logger.info(`🌍 Environment: ${config.env}`);
      logger.info(`🔌 WebSocket service initialized`);
    });

    // Monthly billing automation removed

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await mongoose.connection.close();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during database shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;