"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = exports.mealPlanSchemas = exports.messProfileSchemas = exports.userSchemas = exports.authSchemas = exports.commonSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("./errorHandler");
// Common validation schemas
exports.commonSchemas = {
    id: joi_1.default.string().hex().length(24).required(),
    email: joi_1.default.string().email().lowercase().trim().required(),
    password: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .message('Password must be at least 8 characters with uppercase, lowercase, and number')
        .required(),
    phone: joi_1.default.string().pattern(/^[+]?[\d\s\-\(\)]+$/).required(),
    name: joi_1.default.string().min(2).max(50).trim().required(),
    role: joi_1.default.string().valid('user', 'mess-owner', 'admin').required(),
    pagination: {
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
        sortBy: joi_1.default.string().valid('createdAt', 'updatedAt', 'name', 'email').default('createdAt'),
        sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
    },
};
// Auth validation schemas
exports.authSchemas = {
    register: joi_1.default.object({
        firstName: exports.commonSchemas.name,
        lastName: exports.commonSchemas.name,
        email: exports.commonSchemas.email,
        phone: exports.commonSchemas.phone,
        password: exports.commonSchemas.password,
        role: exports.commonSchemas.role,
    }),
    login: joi_1.default.object({
        email: exports.commonSchemas.email,
        password: joi_1.default.string().required(),
    }),
    sendOtp: joi_1.default.object({
        email: exports.commonSchemas.email,
        type: joi_1.default.string().valid('verification', 'reset').default('verification'),
    }),
    verifyOtp: joi_1.default.object({
        email: exports.commonSchemas.email,
        code: joi_1.default.string().length(6).pattern(/^\d+$/).required(),
    }),
    resetPassword: joi_1.default.object({
        email: exports.commonSchemas.email,
        otp: joi_1.default.string().length(6).pattern(/^\d+$/).required(),
        newPassword: exports.commonSchemas.password,
    }),
};
// User validation schemas
exports.userSchemas = {
    updateProfile: joi_1.default.object({
        firstName: exports.commonSchemas.name.optional(),
        lastName: exports.commonSchemas.name.optional(),
        phone: exports.commonSchemas.phone.optional(),
        address: joi_1.default.string().max(200).optional(),
        gender: joi_1.default.string().valid('male', 'female', 'other').optional(),
        dob: joi_1.default.date().max('now').optional(),
    }),
    changePassword: joi_1.default.object({
        currentPassword: joi_1.default.string().required(),
        newPassword: exports.commonSchemas.password,
    }),
};
// Mess profile validation schemas
exports.messProfileSchemas = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        description: joi_1.default.string().max(500).optional(),
        address: joi_1.default.string().max(200).required(),
        phone: exports.commonSchemas.phone,
        email: exports.commonSchemas.email,
        capacity: joi_1.default.number().integer().min(1).max(1000).required(),
        monthlyFee: joi_1.default.number().positive().required(),
        mealPlan: joi_1.default.object({
            breakfast: joi_1.default.boolean().default(true),
            lunch: joi_1.default.boolean().default(true),
            dinner: joi_1.default.boolean().default(true),
        }).optional(),
        operatingHours: joi_1.default.object({
            breakfast: joi_1.default.object({
                start: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
                end: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            }).optional(),
            lunch: joi_1.default.object({
                start: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
                end: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            }).optional(),
            dinner: joi_1.default.object({
                start: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
                end: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            }).optional(),
        }).optional(),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        description: joi_1.default.string().max(500).optional(),
        address: joi_1.default.string().max(200).optional(),
        phone: exports.commonSchemas.phone.optional(),
        email: exports.commonSchemas.email.optional(),
        capacity: joi_1.default.number().integer().min(1).max(1000).optional(),
        monthlyFee: joi_1.default.number().positive().optional(),
        mealPlan: joi_1.default.object({
            breakfast: joi_1.default.boolean(),
            lunch: joi_1.default.boolean(),
            dinner: joi_1.default.boolean(),
        }).optional(),
        operatingHours: joi_1.default.object({
            breakfast: joi_1.default.object({
                start: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
                end: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            }).optional(),
            lunch: joi_1.default.object({
                start: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
                end: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            }).optional(),
            dinner: joi_1.default.object({
                start: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
                end: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            }).optional(),
        }).optional(),
    }),
};
// Meal plan validation schemas
exports.mealPlanSchemas = {
    create: joi_1.default.object({
        date: joi_1.default.date().min('now').required(),
        breakfast: joi_1.default.object({
            menu: joi_1.default.string().max(200).required(),
            time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        }).optional(),
        lunch: joi_1.default.object({
            menu: joi_1.default.string().max(200).required(),
            time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        }).optional(),
        dinner: joi_1.default.object({
            menu: joi_1.default.string().max(200).required(),
            time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        }).optional(),
    }),
    update: joi_1.default.object({
        breakfast: joi_1.default.object({
            menu: joi_1.default.string().max(200).required(),
            time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        }).optional(),
        lunch: joi_1.default.object({
            menu: joi_1.default.string().max(200).required(),
            time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        }).optional(),
        dinner: joi_1.default.object({
            menu: joi_1.default.string().max(200).required(),
            time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        }).optional(),
    }),
};
// Validation middleware factory
const validate = (schema, location = 'body') => {
    return (req, _res, next) => {
        const data = req[location];
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const validationError = new errorHandler_1.CustomError('Validation failed', 400);
            return next(validationError);
        }
        // Replace request data with validated data
        req[location] = value;
        next();
    };
};
exports.validate = validate;
// Export all schemas
exports.schemas = {
    common: exports.commonSchemas,
    auth: exports.authSchemas,
    user: exports.userSchemas,
    messProfile: exports.messProfileSchemas,
    mealPlan: exports.mealPlanSchemas,
};
exports.default = {
    validate: exports.validate,
    schemas: exports.schemas,
    commonSchemas: exports.commonSchemas,
    authSchemas: exports.authSchemas,
    userSchemas: exports.userSchemas,
    messProfileSchemas: exports.messProfileSchemas,
    mealPlanSchemas: exports.mealPlanSchemas,
};
//# sourceMappingURL=validation.js.map