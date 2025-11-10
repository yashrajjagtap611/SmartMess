import QRCode from 'qrcode';
import crypto from 'crypto';
import MealActivation from '../models/MealActivation';
import MessMembership from '../models/MessMembership';
import Meal from '../models/Meal';

export interface QRCodeData {
  userId: string;
  messId: string;
  mealId: string;
  mealPlanId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  timestamp: number;
  signature: string;
}

export interface GenerateQRCodeOptions {
  userId: string;
  messId: string;
  mealId: string;
  mealPlanId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date?: Date;
}

class QRCodeService {
  private readonly SECRET_KEY: string = process.env.QR_SECRET_KEY || 'smartmess-qr-secret-2024';

  /**
   * Generate a unique QR code for meal activation
   */
  async generateMealQRCode(options: GenerateQRCodeOptions): Promise<{
    qrCode: string;
    qrCodeData: string;
    activationId: string;
    expiresAt: Date;
  }> {
    const { userId, messId, mealId, mealPlanId, mealType, date = new Date() } = options;

    // Validate user has active subscription for this meal plan
    const subscription = await MessMembership.findOne({
      userId,
      messId,
      mealPlanId,
      status: 'active'
    });

    if (!subscription) {
      throw new Error('No active subscription found for this meal plan');
    }

    // Validate meal exists and is available
    const meal = await Meal.findOne({
      _id: mealId,
      messId,
      type: mealType,
      isAvailable: true,
      associatedMealPlans: mealPlanId
    });

    if (!meal) {
      throw new Error('Meal not found or not available for your subscription');
    }

    // Check if user already has an active QR code for this meal today
    const today = new Date(date);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingActivation = await MealActivation.findOne({
      userId,
      mealId,
      mealType,
      activationDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['generated', 'activated'] }
    });

    if (existingActivation) {
      // Return existing QR code if still valid
      if (existingActivation.status === 'generated' && existingActivation.expiresAt > new Date()) {
        const qrCodeData = await this.createQRCodeData({
          userId,
          messId,
          mealId,
          mealPlanId,
          mealType,
          date: existingActivation.activationDate
        });

        return {
          qrCode: existingActivation.qrCode,
          qrCodeData,
          activationId: existingActivation._id.toString(),
          expiresAt: existingActivation.expiresAt
        };
      } else if (existingActivation.status === 'activated') {
        throw new Error('You have already activated this meal today');
      }
    }

    // Generate new QR code
    const timestamp = Date.now();
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const qrCodeString = `${userId}-${messId}-${mealId}-${mealType}-${timestamp}-${uniqueId}`;

    // Create QR code data with signature
    const qrCodeData = await this.createQRCodeData({
      userId,
      messId,
      mealId,
      mealPlanId,
      mealType,
      date: new Date(date)
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    // Set expiration based on meal type timing
    const expiresAt = this.calculateExpirationTime(mealType, new Date(date));

    // Save activation record
    const activation = new MealActivation({
      userId,
      messId,
      mealId,
      mealPlanId,
      mealType,
      activationDate: new Date(date),
      activationTime: new Date(),
      qrCode: qrCodeImage,
      status: 'generated',
      expiresAt
    });

    await activation.save();

    return {
      qrCode: qrCodeImage,
      qrCodeData,
      activationId: activation._id.toString(),
      expiresAt
    };
  }

  /**
   * Validate and activate a QR code
   */
  async activateQRCode(qrCodeData: string, scannedBy: string, scannerType: 'user' | 'mess_owner' = 'mess_owner'): Promise<{
    success: boolean;
    message: string;
    activation?: any;
    mealInfo?: any;
  }> {
    try {
      // Parse and validate QR code data
      const parsedData = JSON.parse(qrCodeData) as QRCodeData;
      
      // Verify signature
      if (!this.verifySignature(parsedData)) {
        return {
          success: false,
          message: 'Invalid QR code signature'
        };
      }

      // Find activation record
      const activation = await MealActivation.findOne({
        userId: parsedData.userId,
        messId: parsedData.messId,
        mealId: parsedData.mealId,
        mealType: parsedData.mealType,
        status: 'generated'
      }).populate([
        { path: 'mealId', model: 'Meal' },
        { path: 'userId', model: 'User', select: 'name email' }
      ]);

      if (!activation) {
        return {
          success: false,
          message: 'QR code not found or already used'
        };
      }

      // Check expiration
      if (activation.expiresAt < new Date()) {
        activation.status = 'expired';
        await activation.save();
        return {
          success: false,
          message: 'QR code has expired'
        };
      }

      // Validate meal timing
      const isValidTime = this.isValidMealTime(parsedData.mealType);
      if (!isValidTime && scannerType === 'mess_owner') {
        return {
          success: false,
          message: `It's not the right time for ${parsedData.mealType}`
        };
      }

      // Activate the meal
      activation.status = 'activated';
      activation.scannedBy = scannedBy;
      activation.scannedAt = new Date();
      activation.metadata = {
        ...activation.metadata,
        scannerType
      };

      await activation.save();

      // Get meal information
      const meal = await Meal.findById(parsedData.mealId);

      return {
        success: true,
        message: 'Meal activated successfully',
        activation: {
          id: activation._id,
          userId: activation.userId,
          mealType: activation.mealType,
          activatedAt: activation.scannedAt,
          scannedBy: activation.scannedBy
        },
        mealInfo: meal ? {
          name: meal.name,
          type: meal.type,
          description: meal.description,
          imageUrl: meal.imageUrl
        } : null
      };

    } catch (error) {
      console.error('Error activating QR code:', error);
      return {
        success: false,
        message: 'Invalid QR code format'
      };
    }
  }

  /**
   * Get user's meal activation history
   */
  async getUserMealHistory(userId: string, limit: number = 50): Promise<any[]> {
    const activations = await MealActivation.find({
      userId,
      status: 'activated'
    })
    .populate([
      { path: 'mealId', model: 'Meal', select: 'name type description imageUrl' },
      { path: 'messId', model: 'MessProfile', select: 'name' }
    ])
    .sort({ scannedAt: -1 })
    .limit(limit);

    return activations.map(activation => ({
      id: activation._id,
      mealType: activation.mealType,
      activatedAt: activation.scannedAt,
      meal: activation.mealId,
      mess: activation.messId,
      scannedBy: activation.scannedBy
    }));
  }

  /**
   * Get user's active meal QR codes for today
   */
  async getUserActiveMeals(userId: string, date: Date = new Date()): Promise<any[]> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const activations = await MealActivation.find({
      userId,
      activationDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['generated', 'activated'] }
    })
    .populate([
      { path: 'mealId', model: 'Meal', select: 'name type description imageUrl' },
      { path: 'messId', model: 'MessProfile', select: 'name' }
    ])
    .sort({ activationTime: -1 });

    return activations.map(activation => ({
      id: activation._id,
      mealType: activation.mealType,
      status: activation.status,
      qrCode: activation.qrCode,
      expiresAt: activation.expiresAt,
      activatedAt: activation.scannedAt,
      meal: activation.mealId,
      mess: activation.messId
    }));
  }

  /**
   * Create QR code data with signature
   */
  private async createQRCodeData(options: {
    userId: string;
    messId: string;
    mealId: string;
    mealPlanId: string;
    mealType: string;
    date: Date;
  }): Promise<string> {
    const { userId, messId, mealId, mealPlanId, mealType, date } = options;
    const timestamp = Date.now();
    const dateString: string = date.toISOString().split('T')[0] || date.toISOString().substring(0, 10);

    const dataToSign = `${userId}:${messId}:${mealId}:${mealPlanId}:${mealType}:${dateString}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(dataToSign)
      .digest('hex');

    const qrData: QRCodeData = {
      userId,
      messId,
      mealId,
      mealPlanId,
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
      date: dateString,
      timestamp,
      signature
    };

    return JSON.stringify(qrData);
  }

  /**
   * Verify QR code signature
   */
  private verifySignature(data: QRCodeData): boolean {
    const { userId, messId, mealId, mealPlanId, mealType, date, timestamp, signature } = data;
    const dataToSign = `${userId}:${messId}:${mealId}:${mealPlanId}:${mealType}:${date}:${timestamp}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(dataToSign)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Calculate expiration time based on meal type
   */
  private calculateExpirationTime(mealType: string, date: Date): Date {
    const expirationDate = new Date(date);
    
    switch (mealType) {
      case 'breakfast':
        expirationDate.setHours(11, 0, 0, 0); // Expires at 11 AM
        break;
      case 'lunch':
        expirationDate.setHours(16, 0, 0, 0); // Expires at 4 PM
        break;
      case 'dinner':
        expirationDate.setHours(22, 0, 0, 0); // Expires at 10 PM
        break;
      default:
        expirationDate.setHours(23, 59, 59, 999); // End of day
    }

    return expirationDate;
  }

  /**
   * Check if current time is valid for meal type
   */
  private isValidMealTime(mealType: string): boolean {
    const now = new Date();
    const hour = now.getHours();

    switch (mealType) {
      case 'breakfast':
        return hour >= 6 && hour < 11;
      case 'lunch':
        return hour >= 11 && hour < 16;
      case 'dinner':
        return hour >= 16 && hour < 22;
      default:
        return false;
    }
  }
}

export default new QRCodeService();
