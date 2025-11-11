"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    // JWT Configuration
    JWT: {
        EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '30d',
        REFRESH_EXPIRES_IN: '7d',
    },
    // OTP Configuration
    OTP: {
        EXPIRY_MINUTES: parseInt(process.env['OTP_EXPIRY_MINUTES'] || '10'),
        LENGTH: 6,
    },
    // File Upload Configuration
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
    // Pagination Configuration
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
    // Rate Limiting Configuration
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: process.env['NODE_ENV'] === 'development' ? 10000 : 1000, // Much higher for development
    },
    // Email Configuration
    EMAIL: {
        FROM_NAME: 'SmartMess',
        FROM_EMAIL: process.env['EMAIL_USER'] || 'noreply@SmartMess.com',
    },
    // Database Configuration
    DATABASE: {
        CONNECTION_TIMEOUT: 30000,
        MAX_POOL_SIZE: 10,
    },
    // Server Configuration
    SERVER: {
        PORT: process.env['PORT'] || 5000,
        HOST: process.env['HOST'] || 'localhost',
        NODE_ENV: process.env['NODE_ENV'] || 'development',
    },
};
//# sourceMappingURL=config.js.map