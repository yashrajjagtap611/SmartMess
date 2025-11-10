import Joi from 'joi';

export interface PaymentValidationData {
  messId: string;
  amount: number;
  method: string;
  plan?: string;
  notes?: string;
}

export interface PaymentValidationResult {
  isValid: boolean;
  errors?: string[];
}

export const validatePaymentData = (data: PaymentValidationData): PaymentValidationResult => {
  const schema = Joi.object({
    messId: Joi.string().required().messages({
      'string.empty': 'Mess ID is required',
      'any.required': 'Mess ID is required'
    }),
    amount: Joi.number().positive().required().messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'any.required': 'Amount is required'
    }),
    method: Joi.string().valid('upi', 'online', 'cash', 'bank_transfer', 'cheque').required().messages({
      'string.empty': 'Payment method is required',
      'any.only': 'Payment method must be one of: upi, online, cash, bank_transfer, cheque',
      'any.required': 'Payment method is required'
    }),
    plan: Joi.string().optional().allow('', null),
    notes: Joi.string().optional().allow('', null).max(500).messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
  });

  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true
  };
};

export const validatePaymentStatusUpdate = (data: { status: string; notes?: string }): PaymentValidationResult => {
  const schema = Joi.object({
    status: Joi.string().valid('paid', 'pending', 'overdue', 'failed', 'refunded').required().messages({
      'string.empty': 'Payment status is required',
      'any.only': 'Payment status must be one of: paid, pending, overdue, failed, refunded',
      'any.required': 'Payment status is required'
    }),
    notes: Joi.string().optional().allow('', null).max(500).messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
  });

  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true
  };
};

export const validatePaymentReminder = (data: { membershipId: string }): PaymentValidationResult => {
  const schema = Joi.object({
    membershipId: Joi.string().required().messages({
      'string.empty': 'Membership ID is required',
      'any.required': 'Membership ID is required'
    })
  });

  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true
  };
};
