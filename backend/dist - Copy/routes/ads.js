"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const adController_1 = require("../controllers/adController");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const security_1 = require("../middleware/security");
const cloudinaryService_1 = require("../services/cloudinaryService");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Configure multer for ad file uploads (memory storage for Cloudinary)
const adUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (_req, file, cb) => {
        // Allow images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image and video files are allowed'));
        }
    }
});
// Public routes (no auth required for ad card)
router.get('/settings', adController_1.AdController.getSettings);
router.get('/ad-card/active', requireAuth_1.default, adController_1.AdController.getActiveAdCard);
router.post('/ad-card/impression', requireAuth_1.default, security_1.generalRateLimiter, adController_1.AdController.recordAdCardImpression);
router.post('/ad-card/click', requireAuth_1.default, security_1.generalRateLimiter, adController_1.AdController.recordAdCardClick);
// Mess owner routes (require auth)
router.use(requireAuth_1.default);
router.use(security_1.generalRateLimiter);
// Credits
router.get('/credits', adController_1.AdController.getCredits);
router.post('/credits/purchase', adController_1.AdController.purchaseCredits);
// File upload for ad campaigns
router.post('/upload', requireAuth_1.default, adUpload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }
        const fileType = req.body.type || (req.file.mimetype.startsWith('image/') ? 'image' : 'video');
        const folder = `SmartMess/ads/${fileType}s`;
        // Upload to Cloudinary
        const uploadResult = await (0, cloudinaryService_1.uploadMulterFile)(req.file, folder);
        res.status(200).json({
            success: true,
            data: {
                url: uploadResult.secure_url,
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                fileSize: req.file.size
            },
            message: 'File uploaded successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error uploading ad file:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload file'
        });
    }
});
// Campaign management
router.post('/campaigns/calculate-target', adController_1.AdController.calculateTargetUserCount);
router.post('/campaigns/audience', adController_1.AdController.getAudienceList);
router.post('/campaigns', adController_1.AdController.createCampaign);
router.get('/campaigns', adController_1.AdController.getCampaigns);
router.get('/campaigns/:campaignId/analytics', adController_1.AdController.getCampaignAnalytics);
exports.default = router;
//# sourceMappingURL=ads.js.map