import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AdController } from '../controllers/adController';
import requireAuth from '../middleware/requireAuth';
import { generalRateLimiter } from '../middleware/security';
import { uploadMulterFile } from '../services/cloudinaryService';
import logger from '../utils/logger';

const router: Router = Router();

// Configure multer for ad file uploads (memory storage for Cloudinary)
const adUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Public routes (no auth required for ad card)
router.get('/settings', AdController.getSettings);
router.get('/ad-card/active', requireAuth, AdController.getActiveAdCard);
router.post('/ad-card/impression', requireAuth, generalRateLimiter, AdController.recordAdCardImpression);
router.post('/ad-card/click', requireAuth, generalRateLimiter, AdController.recordAdCardClick);

// Mess owner routes (require auth)
router.use(requireAuth);
router.use(generalRateLimiter);

// Credits
router.get('/credits', AdController.getCredits);
router.post('/credits/purchase', AdController.purchaseCredits);

// File upload for ad campaigns
router.post('/upload', requireAuth, adUpload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const uploadResult = await uploadMulterFile(req.file, folder);

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
  } catch (error: any) {
    logger.error('Error uploading ad file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
});

// Campaign management
router.post('/campaigns/calculate-target', AdController.calculateTargetUserCount);
router.post('/campaigns/audience', AdController.getAudienceList);
router.post('/campaigns', AdController.createCampaign);
router.get('/campaigns', AdController.getCampaigns);
router.get('/campaigns/:campaignId/analytics', AdController.getCampaignAnalytics);

export default router;


