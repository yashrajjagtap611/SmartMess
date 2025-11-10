import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import TutorialVideo from '../../models/TutorialVideo';

const router: Router = Router();

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

router.get('/', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const videos = await TutorialVideo.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    return res.status(200).json({
      success: true,
      data: videos
    });
  } catch (err) {
    console.error('Error fetching tutorial videos:', err);
    return handleAuthError(res, err);
  }
});

router.get('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = await TutorialVideo.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Tutorial video not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: video
    });
  } catch (err) {
    console.error('Error fetching tutorial video:', err);
    return handleAuthError(res, err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl, category, order, thumbnailUrl, duration, isActive } = req.body;

    if (!title || !videoUrl || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, video URL, and category are required'
      });
    }

    if (!['user', 'mess-owner', 'general'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be user, mess-owner, or general'
      });
    }

    const userId = (req as any).user.id;
    const video = new TutorialVideo({
      title,
      description,
      videoUrl,
      category,
      order: order || 0,
      thumbnailUrl,
      duration: duration || '0:00',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: userId,
      updatedBy: userId
    });

    await video.save();

    return res.status(201).json({
      success: true,
      message: 'Tutorial video created successfully',
      data: video
    });
  } catch (err) {
    console.error('Error creating tutorial video:', err);
    return handleAuthError(res, err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, category, order, thumbnailUrl, duration, isActive } = req.body;

    const video = await TutorialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Tutorial video not found'
      });
    }

    if (category && !['user', 'mess-owner', 'general'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be user, mess-owner, or general'
      });
    }

    const userId = (req as any).user.id;

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (category !== undefined) video.category = category;
    if (order !== undefined) video.order = order;
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
    if (duration !== undefined) video.duration = duration;
    if (isActive !== undefined) video.isActive = isActive;
    video.updatedBy = userId;

    await video.save();

    return res.status(200).json({
      success: true,
      message: 'Tutorial video updated successfully',
      data: video
    });
  } catch (err) {
    console.error('Error updating tutorial video:', err);
    return handleAuthError(res, err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = await TutorialVideo.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Tutorial video not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tutorial video deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting tutorial video:', err);
    return handleAuthError(res, err);
  }
});

export default router;

