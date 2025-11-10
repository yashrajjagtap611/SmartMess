import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler';

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().hex().length(24).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must be at least 8 characters with uppercase, lowercase, and number')
    .required(),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).required(),
  name: Joi.string().min(2).max(50).trim().required(),
  role: Joi.string().valid('user', 'mess-owner', 'admin').required(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'email').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  },
};

// Auth validation schemas
export const authSchemas = {
  register: Joi.object({
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: commonSchemas.password,
    role: commonSchemas.role,
  }),

  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(),
  }),

  sendOtp: Joi.object({
    email: commonSchemas.email,
    type: Joi.string().valid('verification', 'reset').default('verification'),
  }),

  verifyOtp: Joi.object({
    email: commonSchemas.email,
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),

  resetPassword: Joi.object({
    email: commonSchemas.email,
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: commonSchemas.password,
  }),
};

// User validation schemas
export const userSchemas = {
  updateProfile: Joi.object({
    firstName: commonSchemas.name.optional(),
    lastName: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional(),
    address: Joi.string().max(200).optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    dob: Joi.date().max('now').optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password,
  }),
};

// Mess profile validation schemas
export const messProfileSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    address: Joi.string().max(200).required(),
    phone: commonSchemas.phone,
    email: commonSchemas.email,
    capacity: Joi.number().integer().min(1).max(1000).required(),
    monthlyFee: Joi.number().positive().required(),
    mealPlan: Joi.object({
      breakfast: Joi.boolean().default(true),
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true),
    }).optional(),
    operatingHours: Joi.object({
      breakfast: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
      lunch: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
      dinner: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
    }).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    address: Joi.string().max(200).optional(),
    phone: commonSchemas.phone.optional(),
    email: commonSchemas.email.optional(),
    capacity: Joi.number().integer().min(1).max(1000).optional(),
    monthlyFee: Joi.number().positive().optional(),
    mealPlan: Joi.object({
      breakfast: Joi.boolean(),
      lunch: Joi.boolean(),
      dinner: Joi.boolean(),
    }).optional(),
    operatingHours: Joi.object({
      breakfast: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
      lunch: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
      dinner: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
    }).optional(),
  }),
};

// Meal plan validation schemas
export const mealPlanSchemas = {
  create: Joi.object({
    date: Joi.date().min('now').required(),
    breakfast: Joi.object({
      menu: Joi.string().max(200).required(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    }).optional(),
    lunch: Joi.object({
      menu: Joi.string().max(200).required(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    }).optional(),
    dinner: Joi.object({
      menu: Joi.string().max(200).required(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    }).optional(),
  }),

  update: Joi.object({
    breakfast: Joi.object({
      menu: Joi.string().max(200).required(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    }).optional(),
    lunch: Joi.object({
      menu: Joi.string().max(200).required(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    }).optional(),
    dinner: Joi.object({
      menu: Joi.string().max(200).required(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    }).optional(),
  }),
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[location];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationError = new CustomError('Validation failed', 400);
      return next(validationError);
    }

    // Replace request data with validated data
    req[location] = value;
    next();
  };
};

// Export all schemas
export const schemas = {
  common: commonSchemas,
  auth: authSchemas,
  user: userSchemas,
  messProfile: messProfileSchemas,
  mealPlan: mealPlanSchemas,
};

export default {
  validate,
  schemas,
  commonSchemas,
  authSchemas,
  userSchemas,
  messProfileSchemas,
  mealPlanSchemas,
}; 