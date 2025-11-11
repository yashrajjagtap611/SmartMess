"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
// Import configuration and utilities
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const security_1 = require("./middleware/security");
const otpCleanup_1 = require("./utils/otpCleanup");
// Register models so mongoose.model(name) is available across modules
require("./models/MessLeave");
require("./models/BillingAdjustment");
require("./models/MessOffDay");
require("./models/DefaultOffDaySettings");
require("./models/ChatRoom");
require("./models/ChatMessage");
require("./models/ChatNotification");
// Import routes
const routes_1 = __importDefault(require("./routes"));
const websocketService_1 = __importDefault(require("./services/websocketService"));
// Removed monthly billing automation
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);
// Security middleware
app.use(security_1.securityMiddleware);
// Rate limiting
app.use(security_1.generalRateLimiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// CORS configuration
app.use((req, res, next) => {
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
        config_1.default.frontendUrl
    ];
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    else {
        res.header('Access-Control-Allow-Origin', config_1.default.frontendUrl);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// Static file serving
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Request logging
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SmartMess API is running',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
        environment: config_1.default.env
    });
});
// API routes
app.use('/api', routes_1.default);
// 404 handler
app.use(errorHandler_1.notFound);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Database connection and server startup
const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(config_1.default.database.uri, {
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
        // Start OTP cleanup job
        (0, otpCleanup_1.runOtpCleanup)();
        // Initialize WebSocket service
        const wsService = new websocketService_1.default(server);
        // Export for use in other modules
        global.websocketService = wsService;
        // Start the server
        server.listen(config_1.default.port, () => {
            logger_1.default.info(`🚀 Server running on port ${config_1.default.port}`);
            logger_1.default.info(`📱 Frontend URL: ${config_1.default.frontendUrl}`);
            logger_1.default.info(`🌍 Environment: ${config_1.default.env}`);
            logger_1.default.info(`🔌 WebSocket service initialized`);
        });
        // Monthly billing automation removed
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger_1.default.info(`Received ${signal}. Starting graceful shutdown...`);
            server.close(async () => {
                logger_1.default.info('HTTP server closed');
                try {
                    await mongoose_1.default.connection.close();
                    logger_1.default.info('Database connection closed');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.default.error('Error during database shutdown:', error);
                    process.exit(1);
                }
            });
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.default.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map