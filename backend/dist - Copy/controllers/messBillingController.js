"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messBillingController = exports.MessBillingController = void 0;
const messBillingService_1 = require("../services/messBillingService");
const models_1 = require("../models");
class MessBillingController {
    /**
     * Get comprehensive billing details (for dashboard)
     */
    async getMessBillingDetails(req, res) {
        try {
            const { messId } = req.params;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID is required'
                });
            }
            const details = await messBillingService_1.messBillingService.getBillingDetails(messId);
            return res.json({
                success: true,
                data: details
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to load billing details'
            });
        }
    }
    /**
     * Toggle auto-renewal for a specific mess
     */
    async toggleMessAutoRenewal(req, res) {
        try {
            const { messId } = req.params;
            const { enabled } = req.body;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID is required'
                });
            }
            const messCredits = await models_1.MessCredits.findOne({ messId });
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
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update auto-renewal'
            });
        }
    }
    /**
     * Process monthly bill for a specific mess
     */
    async processMessMonthlyBill(req, res) {
        try {
            const { messId } = req.params;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID is required'
                });
            }
            const result = await messBillingService_1.messBillingService.processMessMonthlyBill(messId);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to process bill'
            });
        }
    }
    /**
     * Check credits for user addition for a specific mess
     */
    async checkMessCreditsForUserAddition(req, res) {
        try {
            const { messId } = req.params;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID is required'
                });
            }
            const check = await messBillingService_1.messBillingService.checkCreditsSufficientForNewUser(messId);
            return res.json({
                success: true,
                data: check
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to check credits'
            });
        }
    }
    /**
     * Get credit usage report for a specific mess
     */
    async getMessCreditUsageReport(req, res) {
        try {
            const { messId } = req.params;
            const { startDate, endDate } = req.query;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID is required'
                });
            }
            const options = {};
            if (startDate)
                options.startDate = new Date(startDate);
            if (endDate)
                options.endDate = new Date(endDate);
            const result = await messBillingService_1.messBillingService.getCreditUsageReport(messId, options);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch credit usage report'
            });
        }
    }
    /**
     * Get billing history for a specific mess
     */
    async getMessBillingHistory(req, res) {
        try {
            const { messId } = req.params;
            const { page, limit, type } = req.query;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID is required'
                });
            }
            const result = await messBillingService_1.messBillingService.getBillingHistory(messId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 20,
                type: type
            });
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch billing history'
            });
        }
    }
    /**
     * Get current bill preview for mess owner
     */
    async getMyBillPreview(req, res) {
        try {
            const messId = req.user?.messId;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const bill = await messBillingService_1.messBillingService.calculateMonthlyBill(messId);
            return res.json({
                success: true,
                data: bill
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to calculate bill'
            });
        }
    }
    /**
     * Generate pending bill (manual billing trigger)
     */
    async generateMyPendingBill(req, res) {
        try {
            const messId = req.user?.messId;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const result = await messBillingService_1.messBillingService.generatePendingBill(messId);
            return res.json({
                success: true,
                data: result,
                message: 'Pending bill generated successfully'
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate bill'
            });
        }
    }
    /**
     * Pay pending bill
     */
    async payMyPendingBill(req, res) {
        try {
            const messId = req.user?.messId;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const result = await messBillingService_1.messBillingService.payPendingBill(messId);
            return res.json({
                success: true,
                data: result,
                message: 'Bill paid successfully'
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to pay bill'
            });
        }
    }
    /**
     * Toggle auto-renewal
     */
    async toggleAutoRenewal(req, res) {
        try {
            const messId = req.user?.messId;
            const { autoRenewal } = req.body;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const messCredits = await models_1.MessCredits.findOne({ messId });
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
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update auto-renewal'
            });
        }
    }
    /**
     * Check if sufficient credits for new user
     */
    async checkCreditsForNewUser(req, res) {
        try {
            const messId = req.user?.messId;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const check = await messBillingService_1.messBillingService.checkCreditsSufficientForNewUser(messId);
            return res.json({
                success: true,
                data: check
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to check credits'
            });
        }
    }
    /**
     * Get billing history
     */
    async getMyBillingHistory(req, res) {
        try {
            const messId = req.user?.messId;
            const { page, limit, type } = req.query;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const result = await messBillingService_1.messBillingService.getBillingHistory(messId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 20,
                type: type
            });
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch billing history'
            });
        }
    }
    /**
     * Get credit usage report
     */
    async getMyCreditUsageReport(req, res) {
        try {
            const messId = req.user?.messId;
            const { startDate, endDate } = req.query;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const options = {};
            if (startDate)
                options.startDate = new Date(startDate);
            if (endDate)
                options.endDate = new Date(endDate);
            const result = await messBillingService_1.messBillingService.getCreditUsageReport(messId, options);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch credit usage report'
            });
        }
    }
    /**
     * Check low credits warning
     */
    async checkMyLowCredits(req, res) {
        try {
            const messId = req.user?.messId;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const check = await messBillingService_1.messBillingService.checkLowCredits(messId);
            return res.json({
                success: true,
                data: check
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to check credits'
            });
        }
    }
    /**
     * Get my mess credits details
     */
    async getMyCreditsDetails(req, res) {
        try {
            const messId = req.user?.messId;
            if (!messId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mess ID not found in user session'
                });
            }
            const messCredits = await models_1.MessCredits.findOne({ messId });
            if (!messCredits) {
                return res.status(404).json({
                    success: false,
                    message: 'Mess credits account not found'
                });
            }
            // Get additional info
            const [lowCreditsCheck, billPreview] = await Promise.all([
                messBillingService_1.messBillingService.checkLowCredits(messId),
                messBillingService_1.messBillingService.calculateMonthlyBill(messId)
            ]);
            return res.json({
                success: true,
                data: {
                    credits: messCredits,
                    lowCreditsWarning: lowCreditsCheck,
                    nextBillPreview: billPreview
                }
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch credits details'
            });
        }
    }
}
exports.MessBillingController = MessBillingController;
exports.messBillingController = new MessBillingController();
//# sourceMappingURL=messBillingController.js.map