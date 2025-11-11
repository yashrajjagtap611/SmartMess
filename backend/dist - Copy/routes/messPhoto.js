"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const User_1 = __importDefault(require("../models/User"));
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const cloudinaryService_1 = require("../services/cloudinaryService");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)(); // memory storage
// Helper function to get user by email (for development fallback)
const getUserByEmail = async (email) => {
    const user = await User_1.default.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
// POST /api/mess/photo - Upload new photo
router.post('/', requireAuth_1.default, upload.single('photo'), async (req, res, _next) => {
    try {
        const userId = req.user.id;
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
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
        const fileUrl = await (0, cloudinaryService_1.uploadImage)(tempPath, 'SmartMess');
        // Update both User and MessProfile models
        await User_1.default.findByIdAndUpdate(userId, { messPhotoUrl: fileUrl });
        await MessProfile_1.default.findOneAndUpdate({ userId }, { logo: fileUrl }, { upsert: true, new: true });
        logger_1.default.info('Photo uploaded for user:', { userId, url: fileUrl });
        return res.json({ success: true, url: fileUrl });
    }
    catch (err) {
        const error = err;
        logger_1.default.error('Upload error:', error);
        return res.status(500).json({ error: error.message });
    }
});
// GET /api/mess/photo - Get current user's mess photo URL
router.get('/', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId);
        logger_1.default.info('Getting photo for user:', { userId, currentUrl: user?.messPhotoUrl });
        return res.json({ url: user?.messPhotoUrl || null });
    }
    catch (err) {
        const error = err;
        logger_1.default.error('Get photo error:', error);
        return res.status(500).json({ error: error.message });
    }
});
// PUT /api/mess/photo - Update photo (replace existing)
router.put('/', requireAuth_1.default, upload.single('photo'), async (req, res, _next) => {
    try {
        const userId = req.user.id;
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const user = await User_1.default.findById(userId);
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
            const publicId = (0, cloudinaryService_1.getPublicIdFromUrl)(user.messPhotoUrl);
            if (publicId) {
                await (0, cloudinaryService_1.deleteImage)(publicId);
            }
            logger_1.default.info('Old photo deleted for user:', { userId, oldUrl: user.messPhotoUrl });
        }
        // Upload new photo
        fileUrl = await (0, cloudinaryService_1.uploadImage)(tempPath, 'SmartMess');
        // Update both User and MessProfile models
        await User_1.default.findByIdAndUpdate(userId, { messPhotoUrl: fileUrl });
        await MessProfile_1.default.findOneAndUpdate({ userId }, { logo: fileUrl }, { upsert: true, new: true });
        logger_1.default.info('Photo updated for user:', { userId, newUrl: fileUrl });
        return res.json({ success: true, url: fileUrl });
    }
    catch (err) {
        const error = err;
        logger_1.default.error('Update error:', error);
        return res.status(500).json({ error: error.message });
    }
});
// DELETE /api/mess/photo - Delete photo
router.delete('/', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId);
        if (user?.messPhotoUrl) {
            // Delete from Cloudinary
            const publicId = (0, cloudinaryService_1.getPublicIdFromUrl)(user.messPhotoUrl);
            if (publicId) {
                await (0, cloudinaryService_1.deleteImage)(publicId);
            }
            // Update both User and MessProfile models
            await User_1.default.findByIdAndUpdate(userId, { messPhotoUrl: null });
            await MessProfile_1.default.findOneAndUpdate({ userId }, { logo: null }, { upsert: true, new: true });
            logger_1.default.info('Photo deleted for user:', { userId });
        }
        return res.json({ success: true });
    }
    catch (err) {
        const error = err;
        logger_1.default.error('Delete error:', error);
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=messPhoto.js.map