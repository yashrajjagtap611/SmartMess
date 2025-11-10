// Mess Validation Schemas
// Input validation for mess-related API endpoints

import Joi from 'joi';

export const messProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  location: Joi.object({
    street: Joi.string().min(5).max(200).required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required(),
    country: Joi.string().default('India')
  }).required(),
  types: Joi.array().items(Joi.string().valid('veg', 'non-veg', 'both')).min(1).required(),
  colleges: Joi.array().items(Joi.string()).min(1).required(),
  ownerPhone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).optional(),
  ownerEmail: Joi.string().email().optional(),
  logo: Joi.string().uri().optional(),
  isActive: Joi.boolean().default(true)
});

export const messMembershipSchema = Joi.object({
  messId: Joi.string().hex().length(24).required(),
  mealPlanId: Joi.string().hex().length(24).required(),
  paymentType: Joi.string().valid('pay_now', 'pay_later').required()
});

export const userStatusUpdateSchema = Joi.object({
  isActive: Joi.boolean().required()
});

export const paymentStatusUpdateSchema = Joi.object({
  paymentStatus: Joi.string().valid('paid', 'pending', 'overdue').required()
});

export const leaveMessSchema = Joi.object({
  messId: Joi.string().hex().length(24).required(),
  mealPlanId: Joi.string().hex().length(24).required()
});

export const payBillSchema = Joi.object({
  billId: Joi.string().required(),
  paymentMethod: Joi.string().valid('upi', 'online', 'cash').required()
});

export const mealPlanSubscriptionSchema = Joi.object({
  messId: Joi.string().hex().length(24).required(),
  mealPlanId: Joi.string().hex().length(24).required(),
  paymentType: Joi.string().valid('pay_now', 'pay_later').required()
});

export const planUpgradeSchema = Joi.object({
  messId: Joi.string().hex().length(24).required(),
  newMealPlanId: Joi.string().hex().length(24).required(),
  paymentType: Joi.string().valid('pay_now', 'pay_later').required()
}); 