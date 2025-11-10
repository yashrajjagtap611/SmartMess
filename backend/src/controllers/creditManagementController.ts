import { Request, Response } from 'express';
import { creditManagementService } from '../services/creditManagementService';
import { CreditTransaction } from '../models';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class CreditManagementController {
  // Credit Slab Management
  async createCreditSlab(req: Request, res: Response): Promise<Response> {
    try {
      const { minUsers, maxUsers, creditsPerUser } = req.body;
      const createdBy = (req as AuthRequest).user?.id;

      if (!createdBy) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const slab = await creditManagementService.createCreditSlab({
        minUsers,
        maxUsers,
        creditsPerUser,
        createdBy: createdBy!
      });

      return res.status(201).json({
        success: true,
        data: slab,
        message: 'Credit slab created successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create credit slab'
      });
    }
  }

  async getCreditSlabs(req: Request, res: Response): Promise<Response> {
    try {
      const { isActive } = req.query;
      const filters: any = {};
      
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const slabs = await creditManagementService.getCreditSlabs(filters);

      return res.json({
        success: true,
        data: slabs
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch credit slabs'
      });
    }
  }

  async updateCreditSlab(req: Request, res: Response): Promise<Response> {
    try {
      const { slabId } = req.params;
      const updatedBy = (req as AuthRequest).user?.id;

      if (!updatedBy) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const slab = await creditManagementService.updateCreditSlab(slabId!, {
        ...req.body,
        updatedBy: updatedBy!
      });

      return res.json({
        success: true,
        data: slab,
        message: 'Credit slab updated successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update credit slab'
      });
    }
  }

  async deleteCreditSlab(req: Request, res: Response): Promise<Response> {
    try {
      const { slabId } = req.params;

      const response = await creditManagementService.deleteCreditSlab(slabId!);

      return res.json({
        success: true,
        data: response,
        message: 'Credit slab deleted successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete credit slab'
      });
    }
  }

  // Credit Purchase Plan Management
  async createCreditPurchasePlan(req: Request, res: Response): Promise<Response> {
    try {
      const createdBy = (req as AuthRequest).user?.id;

      if (!createdBy) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const plan = await creditManagementService.createCreditPurchasePlan({
        ...req.body,
        createdBy: createdBy!
      });

      return res.status(201).json({
        success: true,
        data: plan,
        message: 'Credit purchase plan created successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create credit purchase plan'
      });
    }
  }

  async getCreditPurchasePlans(req: Request, res: Response): Promise<Response> {
    try {
      const { isActive, isPopular } = req.query;
      const filters: any = {};
      
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }
      if (isPopular !== undefined) {
        filters.isPopular = isPopular === 'true';
      }

      const plans = await creditManagementService.getCreditPurchasePlans(filters);

      return res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch credit purchase plans'
      });
    }
  }

  async updateCreditPurchasePlan(req: Request, res: Response): Promise<Response> {
    try {
      const { planId } = req.params;
      const updatedBy = (req as AuthRequest).user?.id;

      if (!updatedBy) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const plan = await creditManagementService.updateCreditPurchasePlan(planId!, {
        ...req.body,
        updatedBy: updatedBy!
      });

      return res.json({
        success: true,
        data: plan,
        message: 'Credit purchase plan updated successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update credit purchase plan'
      });
    }
  }

  async deleteCreditPurchasePlan(req: Request, res: Response): Promise<Response> {
    try {
      const { planId } = req.params;

      const response = await creditManagementService.deleteCreditPurchasePlan(planId!);

      return res.json({
        success: true,
        data: response,
        message: 'Credit purchase plan deleted successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete credit purchase plan'
      });
    }
  }

  // Mess Credits Management
  async getMessCredits(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;

      const details = await creditManagementService.getMessCreditsDetails(messId!);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Mess credits not found'
        });
      }

      return res.json({
        success: true,
        data: details
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch mess credits'
      });
    }
  }

  async purchaseCredits(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      const { planId, paymentReference } = req.body;

      const messCredits = await creditManagementService.purchaseCredits(
        messId!,
        planId,
        paymentReference
      );

      return res.json({
        success: true,
        data: messCredits,
        message: 'Credits purchased successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to purchase credits'
      });
    }
  }

  async adjustCredits(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;
      const { amount, description } = req.body;
      const processedBy = (req as AuthRequest).user?.id;

      if (!processedBy) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const messCredits = await creditManagementService.adjustCredits(
        messId!,
        amount,
        description,
        processedBy!
      );

      return res.json({
        success: true,
        data: messCredits,
        message: 'Credits adjusted successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to adjust credits'
      });
    }
  }

  // Free Trial Management
  async getFreeTrialSettings(req: Request, res: Response): Promise<Response> {
    try {
      const settings = await creditManagementService.getFreeTrialSettings();

      return res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch free trial settings'
      });
    }
  }

  async updateFreeTrialSettings(req: Request, res: Response): Promise<Response> {
    try {
      const updatedBy = (req as AuthRequest).user?.id;

      if (!updatedBy) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const settings = await creditManagementService.updateFreeTrialSettings(
        req.body,
        updatedBy!
      );

      return res.json({
        success: true,
        data: settings,
        message: 'Free trial settings updated successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update free trial settings'
      });
    }
  }

  async activateFreeTrial(req: Request, res: Response): Promise<Response> {
    try {
      const { messId } = req.params;

      const messCredits = await creditManagementService.activateFreeTrial(messId!);

      return res.json({
        success: true,
        data: messCredits,
        message: 'Free trial activated successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to activate free trial'
      });
    }
  }

  // Monthly Billing Automation removed

  // Reports and Analytics
  async getCreditTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const { messId, type, status, page = 1, limit = 50 } = req.query;
      const filters: any = {};

      if (messId) filters.messId = messId;
      if (type) filters.type = type;
      if (status) filters.status = status;

      const skip = (Number(page) - 1) * Number(limit);

      const transactions = await CreditTransaction.find(filters)
        .populate('messId', 'name')
        .populate('planId', 'name baseCredits bonusCredits price')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await CreditTransaction.countDocuments(filters);

      return res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch credit transactions'
      });
    }
  }

  async getCreditAnalytics(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate, messId } = req.query;
      const matchQuery: any = {};

      if (startDate && endDate) {
        matchQuery.createdAt = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      if (messId) {
        matchQuery.messId = messId;
      }

      const analytics = await CreditTransaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);

      return res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch credit analytics'
      });
    }
  }
}

export const creditManagementController = new CreditManagementController();
