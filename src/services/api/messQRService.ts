import axios from 'axios';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:5000/api';

export interface MessInfo {
  _id: string;
  name: string;
  location?: {
    city?: string;
    state?: string;
  };
}

export interface MessQRCodeResult {
  qrCode: string;
  qrCodeData: string;
  expiresAt: Date | null;
  isNew?: boolean;
}

export interface MemberInfo {
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
}

export interface VerificationStats {
  totalMembers: number;
  activeMembers: number;
  expiringSoon: number;
  recentVerifications: number;
}

class MessQRService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Get mess owner's mess profile
   */
  async getMyMess(): Promise<MessInfo> {
    try {
      const response = await axios.get(
        `${API_URL}/mess-qr/my-mess`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch mess profile');
    }
  }

  /**
   * Generate QR code for mess verification (or retrieve existing)
   */
  async generateMessQR(messId: string, forceRegenerate = false): Promise<MessQRCodeResult & { isNew: boolean }> {
    try {
      const response = await axios.post(
        `${API_URL}/mess-qr/generate`,
        { messId, forceRegenerate },
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate QR code');
    }
  }

  /**
   * Delete QR code for mess
   */
  async deleteMessQR(messId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${API_URL}/mess-qr/delete`,
        {
          ...this.getAuthHeaders(),
          data: { messId }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete QR code');
    }
  }

  /**
   * Verify user membership by mess owner
   */
  async verifyUserMembership(messId: string, targetUserId: string): Promise<{
    success: boolean;
    message: string;
    member?: MemberInfo;
  }> {
    try {
      const response = await axios.post(
        `${API_URL}/mess-qr/verify-user`,
        { messId, targetUserId },
        this.getAuthHeaders()
      );
      return {
        success: response.data.success,
        message: response.data.message,
        member: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify user'
      };
    }
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats(messId: string): Promise<VerificationStats> {
    try {
      const response = await axios.get(
        `${API_URL}/mess-qr/stats?messId=${messId}`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }

  /**
   * User verifies their membership by scanning mess QR code
   */
  async scanMessQR(qrCodeData: string): Promise<{
    success: boolean;
    message: string;
    member?: MemberInfo;
  }> {
    try {
      const response = await axios.post(
        `${API_URL}/mess-qr/verify-membership`,
        { qrCodeData },
        this.getAuthHeaders()
      );
      return {
        success: response.data.success,
        message: response.data.message,
        member: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to scan QR code'
      };
    }
  }
}

export default new MessQRService();
