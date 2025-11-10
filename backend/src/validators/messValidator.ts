import Joi from 'joi';

// Operating hours schema
const operatingHourSchema = Joi.object({
  meal: Joi.string().required(),
  enabled: Joi.boolean().required(),
  start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

// Location schema
const locationSchema = Joi.object({
  street: Joi.string().max(200).optional(),
  city: Joi.string().min(2).max(100).required(),
  district: Joi.string().max(100).optional(),
  state: Joi.string().min(2).max(100).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  country: Joi.string().max(100).default('India')
});

// Create mess profile schema
export const createMessProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  location: locationSchema.required(),
  colleges: Joi.array().items(Joi.string().min(2).max(200)).min(1).required(),
  ownerPhone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  ownerEmail: Joi.string().email().required(),
  types: Joi.array().items(Joi.string().valid('Veg', 'Non-Veg', 'Mixed')).min(1).required(),
  logo: Joi.string().uri().allow(null).optional(),
  operatingHours: Joi.array().items(operatingHourSchema).optional()
});

// Update mess profile schema
export const updateMessProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  location: locationSchema.optional(),
  colleges: Joi.array().items(Joi.string().min(2).max(200)).min(1).optional(),
  ownerPhone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  ownerEmail: Joi.string().email().optional(),
  types: Joi.array().items(Joi.string().valid('Veg', 'Non-Veg', 'Mixed')).min(1).optional(),
  logo: Joi.string().uri().allow(null).optional(),
  operatingHours: Joi.array().items(operatingHourSchema).optional()
});

// Search mess schema
export const searchMessSchema = Joi.object({
  location: Joi.string().min(2).max(100).optional(),
  pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  types: Joi.array().items(Joi.string().valid('Veg', 'Non-Veg', 'Mixed')).optional(),
  rating: Joi.number().min(1).max(5).optional(),
  priceRange: Joi.object({
    min: Joi.number().min(0).optional(),
    max: Joi.number().min(0).optional()
  }).optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(50).default(10).optional()
});

// Mess membership schema
export const messMembershipSchema = Joi.object({
  messId: Joi.string().required(),
  membershipType: Joi.string().valid('monthly', 'quarterly', 'yearly').required(),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  mealPlan: Joi.object({
    breakfast: Joi.boolean().default(false),
    lunch: Joi.boolean().default(true),
    dinner: Joi.boolean().default(true)
  }).required()
});

// Mess review schema
export const messReviewSchema = Joi.object({
  messId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
  categories: Joi.object({
    foodQuality: Joi.number().min(1).max(5).required(),
    cleanliness: Joi.number().min(1).max(5).required(),
    service: Joi.number().min(1).max(5).required(),
    valueForMoney: Joi.number().min(1).max(5).required()
  }).required()
}); 