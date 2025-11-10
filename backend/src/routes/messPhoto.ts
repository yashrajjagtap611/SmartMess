import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';

import User from '../models/User';
import MessProfile from '../models/MessProfile';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../services/cloudinaryService';
import requireAuth from '../middleware/requireAuth';
import logger from '../utils/logger';

const router: Router = Router();
const upload = multer(); // memory storage

// Extend Request interface to include user
interface AuthRequest extends Request {
  user?: any;
}

// Helper function to get user by email (for development fallback)
const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// POST /api/mess/photo - Upload new photo
router.post('/', requireAuth, upload.single('photo'), async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
        const userId = (req as any).user.id;
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Save file temporarily and upload to Cloudinary
    const fs = require('fs');
    const path = require('path');
    const tempPath = path.join(__dirname, '../../uploads', `${Date.now()}-${req.file.originalname}`);
    
    // Ensure uploads directory exists
    const uploadsDir = path.dirname(tempPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Write file to temp location
    fs.writeFileSync(tempPath, req.file.buffer);
    
    const fileUrl = await uploadImage(tempPath, 'SmartMess');
    
    // Update both User and MessProfile models
    await User.findByIdAndUpdate(userId, { messPhotoUrl: fileUrl });
    await MessProfile.findOneAndUpdate(
      { userId }, 
      { logo: fileUrl }, 
      { upsert: true, new: true }
    );
    
    logger.info('Photo uploaded for user:', { userId, url: fileUrl });
    return res.json({ success: true, url: fileUrl });
  } catch (err: unknown) {
    const error = err as Error;
    logger.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/mess/photo - Get current user's mess photo URL
router.get('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);
    logger.info('Getting photo for user:', { userId, currentUrl: user?.messPhotoUrl });
    return res.json({ url: user?.messPhotoUrl || null });
  } catch (err: unknown) {
    const error = err as Error;
    logger.error('Get photo error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/mess/photo - Update photo (replace existing)
router.put('/', requireAuth, upload.single('photo'), async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
        const userId = (req as any).user.id;
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const user = await User.findById(userId);
    let fileUrl;
    
    // Save file temporarily
    const fs = require('fs');
    const path = require('path');
    const tempPath = path.join(__dirname, '../../uploads', `${Date.now()}-${req.file.originalname}`);
    
    // Ensure uploads directory exists
    const uploadsDir = path.dirname(tempPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Write file to temp location
    fs.writeFileSync(tempPath, req.file.buffer);
    
    if (user?.messPhotoUrl) {
      // Delete old photo from Cloudinary
      const publicId = getPublicIdFromUrl(user.messPhotoUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
      logger.info('Old photo deleted for user:', { userId, oldUrl: user.messPhotoUrl });
    }
    
    // Upload new photo
    fileUrl = await uploadImage(tempPath, 'SmartMess');
    
    // Update both User and MessProfile models
    await User.findByIdAndUpdate(userId, { messPhotoUrl: fileUrl });
    await MessProfile.findOneAndUpdate(
      { userId }, 
      { logo: fileUrl }, 
      { upsert: true, new: true }
    );
    
    logger.info('Photo updated for user:', { userId, newUrl: fileUrl });
    
    return res.json({ success: true, url: fileUrl });
  } catch (err: unknown) {
    const error = err as Error;
    logger.error('Update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/mess/photo - Delete photo
router.delete('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);
    
    if (user?.messPhotoUrl) {
      // Delete from Cloudinary
      const publicId = getPublicIdFromUrl(user.messPhotoUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
      // Update both User and MessProfile models
      await User.findByIdAndUpdate(userId, { messPhotoUrl: null });
      await MessProfile.findOneAndUpdate(
        { userId }, 
        { logo: null }, 
        { upsert: true, new: true }
      );
      logger.info('Photo deleted for user:', { userId });
    }
    
    return res.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    logger.error('Delete error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router as typeof router; 