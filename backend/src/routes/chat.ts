import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ChatController } from '../controllers/chatController';
import requireAuth from '../middleware/requireAuth';
import { generalRateLimiter } from '../middleware/security';
import logger from '../utils/logger';

const router: Router = Router();

// Apply authentication to all routes
router.use(requireAuth);

// Apply rate limiting
router.use(generalRateLimiter);

// Configure multer for chat file uploads
const chatStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/chat');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `chat_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const chatUpload = multer({
  storage: chatStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    // Allow all file types for chat
    cb(null, true);
  }
});

// Room management routes
router.get('/rooms', ChatController.getUserRooms);
router.post('/rooms', ChatController.createRoom);
router.post('/individual-chat/:userId', ChatController.createIndividualChat);
router.get('/rooms/:roomId', ChatController.getRoomDetails);
router.put('/rooms/:roomId/settings', ChatController.updateRoomSettings);
router.delete('/rooms/:roomId', ChatController.deleteRoom);

// Message routes
router.post('/messages', ChatController.sendMessage);
router.get('/rooms/:roomId/messages', ChatController.getRoomMessages);
router.post('/rooms/:roomId/messages/read', ChatController.markMessagesAsRead);
router.delete('/messages/:messageId', ChatController.deleteMessage);
router.post('/messages/:messageId/reaction', ChatController.addReaction);
router.post('/messages/mass-delete', ChatController.massDeleteMessages);

// Notification routes
router.get('/notifications', ChatController.getNotifications);
router.put('/notifications/:notificationId/read', ChatController.markNotificationAsRead);

// Utility routes
router.get('/mess-members', ChatController.getMessMembers);
router.get('/communication-permission/:targetUserId', ChatController.checkCommunicationPermission);

// File upload route
router.post('/upload', chatUpload.single('file'), (req: any, res: Response, next: NextFunction): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    next(error);
  }
});

export default router;