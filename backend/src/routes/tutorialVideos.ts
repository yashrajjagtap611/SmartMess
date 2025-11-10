import { Router, Request, Response } from 'express';
import { handleAuthError } from '../middleware/errorHandler';
import TutorialVideo from '../models/TutorialVideo';

const router: Router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const videos = await TutorialVideo.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    return res.status(200).json({
      success: true,
      data: videos
    });
  } catch (err) {
    console.error('Error fetching tutorial videos:', err);
    return handleAuthError(res, err);
  }
});

router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    if (!category || !['user', 'mess-owner', 'general'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be user, mess-owner, or general'
      });
    }

    const videos = await TutorialVideo.find({ category, isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    return res.status(200).json({
      success: true,
      data: videos
    });
  } catch (err) {
    console.error('Error fetching tutorial videos by category:', err);
    return handleAuthError(res, err);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = await TutorialVideo.findOne({ _id: id, isActive: true })
      .select('-createdBy -updatedBy -__v');

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

export default router;

