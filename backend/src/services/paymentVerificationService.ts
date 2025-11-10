import mongoose from 'mongoose';
import PaymentVerification from '../models/PaymentVerification';
import MessMembership from '../models/MessMembership';
import User from '../models/User';
import MessProfile from '../models/MessProfile';
import MealPlan from '../models/MealPlan';
import { uploadMulterFile } from './cloudinaryService';

export interface CreatePaymentVerificationRequest {
  userId: string;
  messId: string;
  mealPlanId: string;
  amount: number;
  paymentMethod: 'upi' | 'online' | 'cash';
  paymentScreenshot?: Express.Multer.File;
}

export interface UpdatePaymentVerificationRequest {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedBy: string;
}

export class PaymentVerificationService {
  /**
   * Create a new payment verification request
   */
  static async createPaymentVerification(data: CreatePaymentVerificationRequest) {
    try {
      // Check if user already has a pending verification for this mess
      const existingVerification = await PaymentVerification.findOne({
        userId: data.userId,
        messId: data.messId,
        status: 'pending'
      });

      if (existingVerification) {
        throw new Error('You already have a pending payment verification for this mess');
      }

      // Create membership first
      const membership = new MessMembership({
        userId: data.userId,
        messId: data.messId,
        mealPlanId: data.mealPlanId,
        status: 'pending_verification',
        paymentStatus: 'pending',
        paymentAmount: data.amount,
        paymentMethod: data.paymentMethod
      });

      await membership.save();

      // Upload screenshot if provided
      let screenshotUrl = null;
      if (data.paymentScreenshot) {
        const uploadResult = await uploadMulterFile(data.paymentScreenshot, 'payment-screenshots');
        screenshotUrl = uploadResult.secure_url;
      }

      // Create payment verification request
      const paymentVerification = new PaymentVerification({
        userId: data.userId,
        messId: data.messId,
        membershipId: membership._id,
        mealPlanId: data.mealPlanId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentScreenshot: screenshotUrl,
        status: 'pending'
      });

      await paymentVerification.save();

      // Populate the response
      const populatedVerification = await PaymentVerification.findById(paymentVerification._id)
        .populate('userId', 'firstName lastName email phone')
        .populate('messId', 'name')
        .populate('mealPlanId', 'name description pricing');

      return {
        success: true,
        data: populatedVerification,
        message: 'Payment verification request created successfully'
      };
    } catch (error) {
      console.error('Error creating payment verification:', error);
      throw error;
    }
  }

  /**
   * Get payment verification requests for a mess owner
   */
  static async getMessOwnerVerificationRequests(messId: string, status?: string) {
    try {
      const query: any = { messId };
      if (status) {
        query.status = status;
      }

      const verifications = await PaymentVerification.find(query)
        .populate('userId', 'firstName lastName email phone')
        .populate('messId', 'name')
        .populate('mealPlanId', 'name description pricing')
        .populate('verifiedBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: verifications,
        message: 'Payment verification requests retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting verification requests:', error);
      throw error;
    }
  }

  /**
   * Update payment verification status
   */
  static async updatePaymentVerification(
    verificationId: string, 
    data: UpdatePaymentVerificationRequest
  ) {
    try {
      const verification = await PaymentVerification.findById(verificationId);
      if (!verification) {
        throw new Error('Payment verification not found');
      }

      // Update verification status
      verification.status = data.status;
      verification.verifiedBy = new mongoose.Types.ObjectId(data.verifiedBy);
      verification.verifiedAt = new Date();
      
      if (data.status === 'rejected' && data.rejectionReason) {
        verification.rejectionReason = data.rejectionReason;
      }

      await verification.save();

      // If approved, update membership status
      if (data.status === 'approved') {
        await MessMembership.findByIdAndUpdate(verification.membershipId, {
          status: 'active',
          paymentStatus: 'paid',
          paymentVerifiedAt: new Date()
        });
      } else if (data.status === 'rejected') {
        await MessMembership.findByIdAndUpdate(verification.membershipId, {
          status: 'rejected',
          paymentStatus: 'failed'
        });
      }

      // Populate the response
      const populatedVerification = await PaymentVerification.findById(verification._id)
        .populate('userId', 'firstName lastName email phone')
        .populate('messId', 'name')
        .populate('mealPlanId', 'name description pricing')
        .populate('verifiedBy', 'firstName lastName');

      return {
        success: true,
        data: populatedVerification,
        message: `Payment verification ${data.status} successfully`
      };
    } catch (error) {
      console.error('Error updating payment verification:', error);
      throw error;
    }
  }

  /**
   * Get user's payment verification requests
   */
  static async getUserVerificationRequests(userId: string) {
    try {
      const verifications = await PaymentVerification.find({ userId })
        .populate('messId', 'name')
        .populate('mealPlanId', 'name description pricing')
        .populate('verifiedBy', 'firstName lastName')
        .sort({ updatedAt: -1 }); // Sort by most recently updated first

      return {
        success: true,
        data: verifications,
        message: 'User payment verification requests retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting user verification requests:', error);
      throw error;
    }
  }

  /**
   * Get payment verification statistics for mess owner
   */
  static async getVerificationStats(messId: string) {
    try {
      const stats = await PaymentVerification.aggregate([
        { $match: { messId: new mongoose.Types.ObjectId(messId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalPending = stats.find(s => s._id === 'pending')?.count || 0;
      const totalApproved = stats.find(s => s._id === 'approved')?.count || 0;
      const totalRejected = stats.find(s => s._id === 'rejected')?.count || 0;

      return {
        success: true,
        data: {
          pending: totalPending,
          approved: totalApproved,
          rejected: totalRejected,
          total: totalPending + totalApproved + totalRejected
        },
        message: 'Verification statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting verification stats:', error);
      throw error;
    }
  }
}

export default PaymentVerificationService;
