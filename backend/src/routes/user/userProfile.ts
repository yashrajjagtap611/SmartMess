import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import { AuthenticatedRequest } from '../../types/requests';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router: Router = Router();

// Error handling middleware for multer
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  return next();
};

// GET /api/user/profile - Get current user's profile
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map backend fields to frontend expected fields
    const profileData = {
      ...user.toObject(),
      avatar: user.profilePicture || user.messPhotoUrl || null
    };

    return res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/profile - Update current user's profile
router.put('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email should be updated via separate endpoint
    delete updateData.role;
    delete updateData.isVerified;

    // Map avatar field to profilePicture for backend storage
    if (updateData.avatar !== undefined) {
      updateData.profilePicture = updateData.avatar;
      delete updateData.avatar;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map backend fields to frontend expected fields
    const profileData = {
      ...user.toObject(),
      avatar: user.profilePicture || user.messPhotoUrl || null
    };

    return res.status(200).json({
      success: true,
      data: profileData,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/user/profile/avatar - Get user's avatar
router.get('/avatar', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const user = await User.findById(userId).select('messPhotoUrl profilePicture');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return profilePicture if available, otherwise fallback to messPhotoUrl
    const avatarUrl = user.profilePicture || user.messPhotoUrl || null;

    return res.status(200).json({
      success: true,
      data: {
        avatar: avatarUrl
      }
    });
  } catch (err) {
    console.error('Error fetching user avatar:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/profile/avatar - Update user's avatar
router.put('/avatar', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { profilePicture: avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: avatar },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        avatar: user.profilePicture
      },
      message: 'Avatar updated successfully'
    });
  } catch (err) {
    console.error('Error updating user avatar:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/user/profile/avatar - Upload user's avatar file
router.post('/avatar', requireAuth, upload.single('avatar'), handleMulterError, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary only
    const { uploadImage } = await import('../../services/cloudinaryService');
    const profilePictureUrl = await uploadImage(req.file.path, 'profile-pictures');
    
    console.log('Profile picture uploaded to Cloudinary:', { 
      userId, 
      url: profilePictureUrl 
    });

    // Update user's profile picture in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePictureUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after update'
      });
    }

    return res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { avatar: profilePictureUrl }
    });
  } catch (err) {
    console.error('Profile picture upload error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture to Cloudinary'
    });
  }
});

// DELETE /api/user/profile - Delete current user's account
router.delete('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Verify password before deletion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user account:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/user/profile/geocode - Reverse geocode coordinates to address (proxy for OpenStreetMap)
router.get('/geocode', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Small delay to respect Nominatim rate limit (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Proxy request to OpenStreetMap Nominatim API
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&accept-language=en&extratags=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SmartMess App', // Required by Nominatim
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'Failed to fetch address from geocoding service'
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (err) {
    console.error('Error in geocoding proxy:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching address'
    });
  }
});

export default router; 