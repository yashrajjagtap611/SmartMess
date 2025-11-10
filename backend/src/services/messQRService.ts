import QRCode from 'qrcode';
import crypto from 'crypto';
import MessProfile from '../models/MessProfile';
import MessMembership from '../models/MessMembership';

export interface MessQRCodeData {
  messId: string;
  messName: string;
  verificationType: 'membership_check';
  timestamp: number;
  signature: string;
}

export interface MembershipVerificationResult {
  isValid: boolean;
  member?: {
    userId: string;
    name: string;
    email: string;
    memberSince: Date;
    activePlans: Array<{
      planName: string;
      startDate: Date;
      endDate: Date;
      status: string;
    }>;
  };
  message: string;
}

class MessQRService {
  private readonly SECRET_KEY: string = process.env.QR_SECRET_KEY || 'smartmess-qr-secret-2024';

  /**
   * Generate QR code for mess verification
   * This QR code can be printed and placed at the mess entrance
   */
  async generateMessVerificationQR(messId: string, userId: string, forceRegenerate = false): Promise<{
    qrCode: string;
    qrCodeData: string;
    expiresAt: Date | null;
    isNew: boolean;
  }> {
    // Verify user owns this mess
    const messProfile = await MessProfile.findOne({
      _id: messId,
      userId
    });

    if (!messProfile) {
      throw new Error('Mess not found or you do not have permission to generate QR code');
    }

    // Check if QR code already exists and we're not forcing regeneration
    if (messProfile.qrCode?.image && messProfile.qrCode?.data && !forceRegenerate) {
      console.log('✅ Using existing QR code for mess:', messProfile.name);
      console.log('QR Code timestamp:', messProfile.qrCode.generatedAt);
      return {
        qrCode: messProfile.qrCode.image,
        qrCodeData: messProfile.qrCode.data,
        expiresAt: null,
        isNew: false
      };
    }

    console.log('🆕 Generating new QR code for mess:', messProfile.name);

    // Create QR code data with signature
    const timestamp = Date.now();
    const qrData: MessQRCodeData = {
      messId: messProfile._id.toString(),
      messName: messProfile.name,
      verificationType: 'membership_check',
      timestamp,
      signature: this.createSignature(messProfile._id.toString(), timestamp)
    };

    const qrDataString = JSON.stringify(qrData);

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 400
    });

    // Save QR code to database
    messProfile.qrCode = {
      image: qrCodeImage,
      data: qrDataString,
      generatedAt: new Date()
    };
    await messProfile.save();

    console.log('💾 QR code saved to database');

    return {
      qrCode: qrCodeImage,
      qrCodeData: qrDataString,
      expiresAt: null, // This QR code doesn't expire
      isNew: true
    };
  }

  /**
   * Delete QR code for a mess
   */
  async deleteMessQR(messId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const messProfile = await MessProfile.findOneAndUpdate(
        {
          _id: messId,
          userId
        },
        {
          $unset: { qrCode: 1 }
        },
        { new: true }
      );

      if (!messProfile) {
        throw new Error('Mess not found or you do not have permission');
      }

      console.log('🗑️ QR code deleted for mess:', messProfile.name);

      return {
        success: true,
        message: 'QR code deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }

  /**
   * Verify if a user has active membership when they scan the mess QR code
   */
  async verifyUserMembership(
    qrCodeData: string, 
    userId: string
  ): Promise<MembershipVerificationResult> {
    try {
      // Parse QR code data
      const parsedData = JSON.parse(qrCodeData) as MessQRCodeData;

      // Verify signature
      if (!this.verifySignature(parsedData)) {
        return {
          isValid: false,
          message: 'Invalid QR code signature'
        };
      }

      // Verify this is a membership check QR code
      if (parsedData.verificationType !== 'membership_check') {
        return {
          isValid: false,
          message: 'Invalid QR code type'
        };
      }

      // Check if user has active membership
      const activeMemberships = await MessMembership.find({
        userId,
        messId: parsedData.messId,
        status: 'active'
      }).populate([
        { path: 'mealPlanId', select: 'name' },
        { path: 'userId', select: 'name email' }
      ]);

      if (!activeMemberships || activeMemberships.length === 0) {
        return {
          isValid: false,
          message: `You do not have an active membership at ${parsedData.messName}`
        };
      }

      // Get user details from first membership
      const firstMembership = activeMemberships[0];
      if (!firstMembership) {
        return {
          isValid: false,
          message: 'Membership data not found'
        };
      }

      const userDetails = firstMembership.userId as any;

      // Format active plans
      const activePlans = activeMemberships.map(membership => ({
        planName: (membership.mealPlanId as any)?.name || 'Unknown Plan',
        startDate: (membership as any).subscriptionStartDate,
        endDate: (membership as any).subscriptionEndDate,
        status: membership.status
      }));

      return {
        isValid: true,
        member: {
          userId,
          name: userDetails.name,
          email: userDetails.email,
          memberSince: (firstMembership as any).subscriptionStartDate,
          activePlans
        },
        message: `Welcome ${userDetails.name}! You have ${activePlans.length} active plan(s).`
      };

    } catch (error: any) {
      console.error('Error verifying membership:', error);
      return {
        isValid: false,
        message: 'Failed to verify membership. Please try again.'
      };
    }
  }

  /**
   * Verify membership by mess owner scanning user's QR or manual entry
   */
  async verifyUserByMessOwner(
    messId: string,
    messOwnerId: string,
    targetUserId: string
  ): Promise<MembershipVerificationResult> {
    try {
      // Verify mess owner owns this mess
      const messProfile = await MessProfile.findOne({
        _id: messId,
        userId: messOwnerId
      });

      if (!messProfile) {
        throw new Error('Mess not found or you do not have permission');
      }

      // Check if target user has active membership
      const activeMemberships = await MessMembership.find({
        userId: targetUserId,
        messId,
        status: 'active'
      }).populate([
        { path: 'mealPlanId', select: 'name' },
        { path: 'userId', select: 'name email' }
      ]);

      if (!activeMemberships || activeMemberships.length === 0) {
        return {
          isValid: false,
          message: 'User does not have an active membership'
        };
      }

      const firstMembership = activeMemberships[0];
      if (!firstMembership) {
        return {
          isValid: false,
          message: 'Membership data not found'
        };
      }

      const userDetails = firstMembership.userId as any;

      const activePlans = activeMemberships.map(membership => ({
        planName: (membership.mealPlanId as any)?.name || 'Unknown Plan',
        startDate: (membership as any).subscriptionStartDate,
        endDate: (membership as any).subscriptionEndDate,
        status: membership.status
      }));

      return {
        isValid: true,
        member: {
          userId: targetUserId,
          name: userDetails.name,
          email: userDetails.email,
          memberSince: (firstMembership as any).subscriptionStartDate,
          activePlans
        },
        message: `Member verified: ${userDetails.name}`
      };

    } catch (error: any) {
      console.error('Error verifying user by mess owner:', error);
      return {
        isValid: false,
        message: error.message || 'Failed to verify membership'
      };
    }
  }

  /**
   * Create signature for QR code data
   */
  private createSignature(messId: string, timestamp: number): string {
    const dataToSign = `${messId}:${timestamp}`;
    return crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(dataToSign)
      .digest('hex');
  }

  /**
   * Verify QR code signature
   */
  private verifySignature(data: MessQRCodeData): boolean {
    const { messId, timestamp, signature } = data;
    const expectedSignature = this.createSignature(messId, timestamp);
    return signature === expectedSignature;
  }

  /**
   * Get mess statistics for verification
   */
  async getMessVerificationStats(messId: string, userId: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    expiringSoon: number;
    recentVerifications: number;
  }> {
    // Verify user owns this mess
    const messProfile = await MessProfile.findOne({
      _id: messId,
      userId
    });

    if (!messProfile) {
      throw new Error('Mess not found or you do not have permission');
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [totalMembers, activeMembers, expiringSoon] = await Promise.all([
      MessMembership.countDocuments({ messId }),
      MessMembership.countDocuments({ messId, status: 'active' }),
      MessMembership.countDocuments({
        messId,
        status: 'active',
        endDate: { $gte: now, $lte: thirtyDaysFromNow }
      })
    ]);

    return {
      totalMembers,
      activeMembers,
      expiringSoon,
      recentVerifications: 0 // Can be implemented with a verification log
    };
  }
}

export default new MessQRService();
