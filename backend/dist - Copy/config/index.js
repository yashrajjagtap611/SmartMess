"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
// Load environment variables
dotenv_1.default.config();
// Environment validation schema
const envSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid('development', 'production', 'test').default('development'),
    PORT: joi_1.default.number().default(5000),
    FRONTEND_URL: joi_1.default.string().uri().default('http://localhost:5173'),
    // Database
    MONGODB_URI: joi_1.default.string().required(),
    // JWT
    JWT_SECRET: joi_1.default.string().min(32).required(),
    JWT_EXPIRES_IN: joi_1.default.string().default('30d'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: joi_1.default.number().default(60000),
    RATE_LIMIT_MAX_REQUESTS: joi_1.default.number().default(1000),
    // Email
    EMAIL_HOST: joi_1.default.string().required(),
    EMAIL_PORT: joi_1.default.number().default(587),
    EMAIL_USER: joi_1.default.string().required(),
    EMAIL_PASS: joi_1.default.string().required(),
    EMAIL_FROM: joi_1.default.string().email().required(),
    // OTP
    OTP_EXPIRY_MINUTES: joi_1.default.number().default(10),
    // Development
    DISABLE_EMAIL: joi_1.default.string().valid('true', 'false').default('false').custom((value) => value === 'true'),
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: joi_1.default.string().required(),
    CLOUDINARY_API_KEY: joi_1.default.string().required(),
    CLOUDINARY_API_SECRET: joi_1.default.string().required(),
}).unknown();
// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
}
// Export validated configuration
exports.config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    frontendUrl: envVars.FRONTEND_URL,
    database: {
        uri: envVars.MONGODB_URI,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        expiresIn: envVars.JWT_EXPIRES_IN,
    },
    rateLimit: {
        windowMs: envVars.RATE_LIMIT_WINDOW_MS,
        max: envVars.RATE_LIMIT_MAX_REQUESTS,
    },
    email: {
        host: envVars.EMAIL_HOST,
        port: envVars.EMAIL_PORT,
        user: envVars.EMAIL_USER,
        pass: envVars.EMAIL_PASS,
        from: envVars.EMAIL_FROM,
    },
    otp: {
        expiryMinutes: envVars.OTP_EXPIRY_MINUTES,
    },
    development: {
        disableEmail: envVars.DISABLE_EMAIL,
    },
    cloudinary: {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY_API_KEY,
        apiSecret: envVars.CLOUDINARY_API_SECRET,
    },
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map