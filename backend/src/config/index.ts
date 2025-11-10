import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  
  // Database
  MONGODB_URI: Joi.string().required(),
  
  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('30d'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(1000),
  
  // Email
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  
  // OTP
  OTP_EXPIRY_MINUTES: Joi.number().default(10),
  
  // Development
  DISABLE_EMAIL: Joi.string().valid('true', 'false').default('false').custom((value) => value === 'true'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated configuration
export const config = {
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

export default config; 