"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const constants_1 = require("../constants");
class DatabaseConnection {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_1.default.info('Database already connected');
            return;
        }
        try {
            const mongoUri = process.env['MONGODB_URI'];
            if (!mongoUri) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }
            const options = {
                maxPoolSize: constants_1.CONFIG.DATABASE.MAX_POOL_SIZE,
                serverSelectionTimeoutMS: constants_1.CONFIG.DATABASE.CONNECTION_TIMEOUT,
                socketTimeoutMS: constants_1.CONFIG.DATABASE.CONNECTION_TIMEOUT,
                bufferCommands: false,
            };
            await mongoose_1.default.connect(mongoUri, options);
            this.isConnected = true;
            logger_1.default.info('Database connected successfully');
        }
        catch (error) {
            logger_1.default.error('Database connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            logger_1.default.info('Database already disconnected');
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_1.default.info('Database disconnected successfully');
        }
        catch (error) {
            logger_1.default.error('Database disconnection failed:', error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return false;
            }
            const admin = mongoose_1.default.connection.db.admin();
            await admin.ping();
            return true;
        }
        catch (error) {
            logger_1.default.error('Database health check failed:', error);
            return false;
        }
    }
}
exports.databaseConnection = DatabaseConnection.getInstance();
//# sourceMappingURL=connection.js.map