"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chatController_1 = require("../controllers/chatController");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const security_1 = require("../middleware/security");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(requireAuth_1.default);
// Apply rate limiting
router.use(security_1.generalRateLimiter);
// Configure multer for chat file uploads
const chatStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads/chat');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `chat_${Date.now()}_${Math.random().toString(36).substring(7)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const chatUpload = (0, multer_1.default)({
    storage: chatStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        // Allow all file types for chat
        cb(null, true);
    }
});
// Room management routes
router.get('/rooms', chatController_1.ChatController.getUserRooms);
router.post('/rooms', chatController_1.ChatController.createRoom);
router.post('/individual-chat/:userId', chatController_1.ChatController.createIndividualChat);
router.get('/rooms/:roomId', chatController_1.ChatController.getRoomDetails);
router.put('/rooms/:roomId/settings', chatController_1.ChatController.updateRoomSettings);
router.delete('/rooms/:roomId', chatController_1.ChatController.deleteRoom);
// Message routes
router.post('/messages', chatController_1.ChatController.sendMessage);
router.get('/rooms/:roomId/messages', chatController_1.ChatController.getRoomMessages);
router.post('/rooms/:roomId/messages/read', chatController_1.ChatController.markMessagesAsRead);
router.delete('/messages/:messageId', chatController_1.ChatController.deleteMessage);
router.post('/messages/:messageId/reaction', chatController_1.ChatController.addReaction);
router.post('/messages/mass-delete', chatController_1.ChatController.massDeleteMessages);
// Notification routes
router.get('/notifications', chatController_1.ChatController.getNotifications);
router.put('/notifications/:notificationId/read', chatController_1.ChatController.markNotificationAsRead);
// Utility routes
router.get('/mess-members', chatController_1.ChatController.getMessMembers);
router.get('/communication-permission/:targetUserId', chatController_1.ChatController.checkCommunicationPermission);
// File upload route
router.post('/upload', chatUpload.single('file'), (req, res, next) => {
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
    }
    catch (error) {
        logger_1.default.error('Error uploading file:', error);
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map