import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import PaymentSettings from '../models/PaymentSettings';

const router: Router = Router();

// Validation functions
const validatePaymentSettings = (settings: any, isUpdate: boolean = false): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // For updates, only validate fields that are present
  if (isUpdate) {
    // Validate UPI ID if provided
    if (settings.upiId !== undefined) {
      if (settings.upiId && settings.upiId.trim().length > 0) {
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
        if (!upiRegex.test(settings.upiId.trim())) {
          errors.push('Please enter a valid UPI ID (e.g., username@bank)');
        }
      }
    }

    // Validate Bank Account if provided
    if (settings.bankAccount !== undefined) {
      if (settings.bankAccount && settings.bankAccount.trim().length > 0) {
        if (settings.bankAccount.trim().length < 10) {
          errors.push('Bank account number must be at least 10 digits');
        }
      }
    }

    // Validate Late Fee Amount if provided
    if (settings.lateFeeAmount !== undefined) {
      if (typeof settings.lateFeeAmount !== 'number' || settings.lateFeeAmount < 0) {
        errors.push('Late fee amount must be a positive number');
      }
    }

    // Validate boolean fields
    if (settings.autoPayment !== undefined && typeof settings.autoPayment !== 'boolean') {
      errors.push('Auto payment must be a boolean value');
    }
    if (settings.lateFee !== undefined && typeof settings.lateFee !== 'boolean') {
      errors.push('Late fee must be a boolean value');
    }
    if (settings.isCashPayment !== undefined && typeof settings.isCashPayment !== 'boolean') {
      errors.push('Cash payment must be a boolean value');
    }
  } else {
    // For new settings, validate all required fields
    // Validate UPI ID (optional but if provided, must be valid)
    if (settings.upiId && settings.upiId.trim().length > 0) {
      const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
      if (!upiRegex.test(settings.upiId.trim())) {
        errors.push('Please enter a valid UPI ID (e.g., username@bank)');
      }
    }

    // Validate Bank Account (optional but if provided, must be valid)
    if (settings.bankAccount && settings.bankAccount.trim().length > 0) {
      if (settings.bankAccount.trim().length < 10) {
        errors.push('Bank account number must be at least 10 digits');
      }
    }

    // Validate Late Fee Amount
    if (settings.lateFeeAmount !== undefined) {
      if (typeof settings.lateFeeAmount !== 'number' || settings.lateFeeAmount < 0) {
        errors.push('Late fee amount must be a positive number');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// GET /api/payment-settings - Get payment settings
router.get('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        // Find payment settings in database
    const settings = await PaymentSettings.findOne({ userId: (req as any).user.id });
    
    // If no settings exist, return default settings
    if (!settings) {
      return res.status(200).json({
        success: true,
        message: 'Payment settings retrieved successfully',
        data: {
          upiId: '',
          bankAccount: '',
          autoPayment: true,
          lateFee: true,
          lateFeeAmount: 50,
          isCashPayment: false
        }
      });
    }

    // Return payment settings data
    return res.status(200).json({
      success: true,
      message: 'Payment settings retrieved successfully',
      data: {
        upiId: settings.upiId,
        bankAccount: settings.bankAccount,
        autoPayment: settings.autoPayment,
        lateFee: settings.lateFee,
        lateFeeAmount: settings.lateFeeAmount,
        isCashPayment: settings.isCashPayment
      }
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// POST /api/payment-settings - Create payment settings
router.post('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const settingsData = req.body;

    // Check if settings already exist
    const existingSettings = await PaymentSettings.findOne({ userId: (req as any).user.id });
    
    if (existingSettings) {
      // If settings exist, update them instead
      console.log('Payment settings exist, updating instead of creating');
      
      // Prepare update data
      const updateFields: any = {};
      
      if (settingsData.upiId !== undefined) {
        updateFields.upiId = settingsData.upiId.trim();
      }
      
      if (settingsData.bankAccount !== undefined) {
        updateFields.bankAccount = settingsData.bankAccount.trim();
      }
      
      if (settingsData.autoPayment !== undefined) {
        updateFields.autoPayment = settingsData.autoPayment;
      }
      
      if (settingsData.lateFee !== undefined) {
        updateFields.lateFee = settingsData.lateFee;
      }
      
      if (settingsData.lateFeeAmount !== undefined) {
        updateFields.lateFeeAmount = settingsData.lateFeeAmount;
      }
      
      if (settingsData.isCashPayment !== undefined) {
        updateFields.isCashPayment = settingsData.isCashPayment;
      }

      // Create a merged settings for validation
      const mergedSettings = {
        ...existingSettings.toObject(),
        ...updateFields
      };

      // Validate the merged settings
      const validation = validatePaymentSettings(mergedSettings, true);
      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Update in database
      const updatedSettings = await PaymentSettings.findOneAndUpdate(
        { userId: (req as any).user.id },
        updateFields,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Payment settings updated successfully',
        data: {
          upiId: updatedSettings!.upiId,
          bankAccount: updatedSettings!.bankAccount,
          autoPayment: updatedSettings!.autoPayment,
          lateFee: updatedSettings!.lateFee,
          lateFeeAmount: updatedSettings!.lateFeeAmount,
          isCashPayment: updatedSettings!.isCashPayment
        }
      });
    }

    // Validate settings data for new creation
    const validation = validatePaymentSettings(settingsData, false);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Create new payment settings
    const newSettings = new PaymentSettings({
      userId,
      upiId: settingsData.upiId?.trim() || '',
      bankAccount: settingsData.bankAccount?.trim() || '',
      autoPayment: settingsData.autoPayment !== undefined ? settingsData.autoPayment : true,
      lateFee: settingsData.lateFee !== undefined ? settingsData.lateFee : true,
      lateFeeAmount: settingsData.lateFeeAmount !== undefined ? settingsData.lateFeeAmount : 50,
      isCashPayment: settingsData.isCashPayment !== undefined ? settingsData.isCashPayment : false
    });

    // Save to database
    const savedSettings = await newSettings.save();

    return res.status(201).json({
      success: true,
      message: 'Payment settings created successfully',
      data: {
        upiId: savedSettings.upiId,
        bankAccount: savedSettings.bankAccount,
        autoPayment: savedSettings.autoPayment,
        lateFee: savedSettings.lateFee,
        lateFeeAmount: savedSettings.lateFeeAmount,
        isCashPayment: savedSettings.isCashPayment
      }
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// PUT /api/payment-settings - Update payment settings
router.put('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const updateData = req.body;

    // Find existing settings
    const existingSettings = await PaymentSettings.findOne({ userId: (req as any).user.id });
    
    if (!existingSettings) {
      // If no settings exist, create new ones
      console.log('No payment settings found, creating new ones');
      
      // Validate the new settings data
      const validation = validatePaymentSettings(updateData, false);
      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Create new payment settings
      const newSettings = new PaymentSettings({
        userId,
        upiId: updateData.upiId?.trim() || '',
        bankAccount: updateData.bankAccount?.trim() || '',
        autoPayment: updateData.autoPayment !== undefined ? updateData.autoPayment : true,
        lateFee: updateData.lateFee !== undefined ? updateData.lateFee : true,
        lateFeeAmount: updateData.lateFeeAmount !== undefined ? updateData.lateFeeAmount : 50,
        isCashPayment: updateData.isCashPayment !== undefined ? updateData.isCashPayment : false
      });

      // Save to database
      const savedSettings = await newSettings.save();

      return res.status(200).json({
        success: true,
        message: 'Payment settings created successfully',
        data: {
          upiId: savedSettings.upiId,
          bankAccount: savedSettings.bankAccount,
          autoPayment: savedSettings.autoPayment,
          lateFee: savedSettings.lateFee,
          lateFeeAmount: savedSettings.lateFeeAmount,
          isCashPayment: savedSettings.isCashPayment
        }
      });
    }

    // Prepare update data
    const updateFields: any = {};
    
    if (updateData.upiId !== undefined) {
      updateFields.upiId = updateData.upiId.trim();
    }
    
    if (updateData.bankAccount !== undefined) {
      updateFields.bankAccount = updateData.bankAccount.trim();
    }
    
    if (updateData.autoPayment !== undefined) {
      updateFields.autoPayment = updateData.autoPayment;
    }
    
    if (updateData.lateFee !== undefined) {
      updateFields.lateFee = updateData.lateFee;
    }
    
    if (updateData.lateFeeAmount !== undefined) {
      updateFields.lateFeeAmount = updateData.lateFeeAmount;
    }
    
    if (updateData.isCashPayment !== undefined) {
      updateFields.isCashPayment = updateData.isCashPayment;
    }

    // Create a merged settings for validation
    const mergedSettings = {
      ...existingSettings.toObject(),
      ...updateFields
    };

    // Validate the merged settings
    const validation = validatePaymentSettings(mergedSettings, true);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Update in database
    const updatedSettings = await PaymentSettings.findOneAndUpdate(
      { userId: (req as any).user.id },
      updateFields,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully',
      data: {
        upiId: updatedSettings!.upiId,
        bankAccount: updatedSettings!.bankAccount,
        autoPayment: updatedSettings!.autoPayment,
        lateFee: updatedSettings!.lateFee,
        lateFeeAmount: updatedSettings!.lateFeeAmount,
        isCashPayment: updatedSettings!.isCashPayment
      }
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

export default router; 