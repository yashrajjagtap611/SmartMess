"use strict";
// Database Configuration
// Centralized database connection and configuration settings
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDatabase = async () => {
    try {
        const mongoUri = process.env['MONGODB_URI'];
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        await mongoose_1.default.connect(mongoUri, {
            // MongoDB connection options
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        });
        logger_1.default.info('✅ Database connected successfully');
        // Handle connection events
        mongoose_1.default.connection.on('error', (error) => {
            logger_1.default.error('❌ Database connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.default.warn('⚠️ Database disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.default.info('🔄 Database reconnected');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose_1.default.connection.close();
                logger_1.default.info('Database connection closed through app termination');
                process.exit(0);
            }
            catch (error) {
                logger_1.default.error('Error during database shutdown:', error);
                process.exit(1);
            }
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to connect to database:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.connection.close();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error closing database connection:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=database.js.map