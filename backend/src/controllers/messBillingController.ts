import { Request, Response } from 'express';
import { messBillingService } from '../services/messBillingService';
import { MessCredits } from '../models';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    messId?: string;
  };
}

export class MessBillingController {
  /**
   * Get comprehensive billing details (for dashboard)
   */
  async getMessBillingDetails(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID is required'
        });
      }

      const details = await messBillingService.getBillingDetails(messId);

      return res.json({
        success: true,
        data: details
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load billing details'
      });
    }
  }

  /**
   * Toggle auto-renewal for a specific mess
   */
  async toggleMessAutoRenewal(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      const { enabled } = req.body;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID is required'
        });
      }

      const messCredits = await MessCredits.findOne({ messId });
      if (!messCredits) {
        return res.status(404).json({
          success: false,
          message: 'Mess credits account not found'
        });
      }

      messCredits.autoRenewal = enabled;
      await messCredits.save();

      return res.json({
        success: true,
        data: messCredits,
        message: `Auto-renewal ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update auto-renewal'
      });
    }
  }

  /**
   * Process monthly bill for a specific mess
   */
  async processMessMonthlyBill(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID is required'
        });
      }

      const result = await messBillingService.processMessMonthlyBill(messId);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process bill'
      });
    }
  }

  /**
   * Check credits for user addition for a specific mess
   */
  async checkMessCreditsForUserAddition(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID is required'
        });
      }

      const check = await messBillingService.checkCreditsSufficientForNewUser(messId);

      return res.json({
        success: true,
        data: check
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check credits'
      });
    }
  }

  /**
   * Get credit usage report for a specific mess
   */
  async getMessCreditUsageReport(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID is required'
        });
      }

      const options: { startDate?: Date; endDate?: Date } = {};
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);

      const result = await messBillingService.getCreditUsageReport(messId, options);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch credit usage report'
      });
    }
  }

  /**
   * Get billing history for a specific mess
   */
  async getMessBillingHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      const { page, limit, type } = req.query;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID is required'
        });
      }

      const result = await messBillingService.getBillingHistory(messId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        type: type as string
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch billing history'
      });
    }
  }

  /**
   * Get current bill preview for mess owner
   */
  async getMyBillPreview(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const bill = await messBillingService.calculateMonthlyBill(messId);

      return res.json({
        success: true,
        data: bill
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to calculate bill'
      });
    }
  }

  /**
   * Generate pending bill (manual billing trigger)
   */
  async generateMyPendingBill(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const result = await messBillingService.generatePendingBill(messId);

      return res.json({
        success: true,
        data: result,
        message: 'Pending bill generated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate bill'
      });
    }
  }

  /**
   * Pay pending bill
   */
  async payMyPendingBill(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const result = await messBillingService.payPendingBill(messId);

      return res.json({
        success: true,
        data: result,
        message: 'Bill paid successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to pay bill'
      });
    }
  }

  /**
   * Toggle auto-renewal
   */
  async toggleAutoRenewal(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      const { autoRenewal } = req.body;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const messCredits = await MessCredits.findOne({ messId });
      if (!messCredits) {
        return res.status(404).json({
          success: false,
          message: 'Mess credits account not found'
        });
      }

      messCredits.autoRenewal = autoRenewal;
      await messCredits.save();

      return res.json({
        success: true,
        data: { autoRenewal: messCredits.autoRenewal },
        message: `Auto-renewal ${autoRenewal ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update auto-renewal'
      });
    }
  }

  /**
   * Check if sufficient credits for new user
   */
  async checkCreditsForNewUser(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const check = await messBillingService.checkCreditsSufficientForNewUser(messId);

      return res.json({
        success: true,
        data: check
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check credits'
      });
    }
  }

  /**
   * Get billing history
   */
  async getMyBillingHistory(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      const { page, limit, type } = req.query;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const result = await messBillingService.getBillingHistory(messId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        type: type as string
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch billing history'
      });
    }
  }

  /**
   * Get credit usage report
   */
  async getMyCreditUsageReport(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      const { startDate, endDate } = req.query;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const options: { startDate?: Date; endDate?: Date } = {};
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);

      const result = await messBillingService.getCreditUsageReport(messId, options);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch credit usage report'
      });
    }
  }

  /**
   * Check low credits warning
   */
  async checkMyLowCredits(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const check = await messBillingService.checkLowCredits(messId);

      return res.json({
        success: true,
        data: check
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check credits'
      });
    }
  }

  /**
   * Get my mess credits details
   */
  async getMyCreditsDetails(req: Request, res: Response): Promise<Response> {
    try {
      const messId = (req as AuthRequest).user?.messId;
      
      if (!messId) {
        return res.status(400).json({
          success: false,
          message: 'Mess ID not found in user session'
        });
      }

      const messCredits = await MessCredits.findOne({ messId });
      if (!messCredits) {
        return res.status(404).json({
          success: false,
          message: 'Mess credits account not found'
        });
      }

      // Get additional info
      const [lowCreditsCheck, billPreview] = await Promise.all([
        messBillingService.checkLowCredits(messId),
        messBillingService.calculateMonthlyBill(messId)
      ]);

      return res.json({
        success: true,
        data: {
          credits: messCredits,
          lowCreditsWarning: lowCreditsCheck,
          nextBillPreview: billPreview
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch credits details'
      });
    }
  }
}

export const messBillingController = new MessBillingController();

