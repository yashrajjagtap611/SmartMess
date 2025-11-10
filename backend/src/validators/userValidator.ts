import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces'
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number (10-15 digits)'
    }),

  address: Joi.string()
    .min(10)
    .max(500)
    .messages({
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address cannot exceed 500 characters'
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other')
    .messages({
      'any.only': 'Gender must be one of: male, female, other'
    }),

  dob: Joi.date()
    .max('now')
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),

  status: Joi.string()
    .valid('active', 'suspended')
    .messages({
      'any.only': 'Status must be one of: active, suspended'
    })
});

export const uploadAvatarSchema = Joi.object({
  avatar: Joi.any()
    .required()
    .messages({
      'any.required': 'Avatar file is required'
    })
});

export const getUserActivitySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  type: Joi.string()
    .valid('all', 'login', 'profile_update', 'password_change', 'register')
    .default('all')
    .messages({
      'any.only': 'Type must be one of: all, login, profile_update, password_change, register'
    })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your new password'
    })
});

export const deleteAccountSchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required to delete account'
    }),

  confirm: Joi.string()
    .valid('DELETE')
    .required()
    .messages({
      'any.only': 'Please type DELETE to confirm account deletion',
      'any.required': 'Please confirm account deletion'
    })
}); 