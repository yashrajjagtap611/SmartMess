"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../../middleware/requireAuth"));
const errorHandler_1 = require("../../middleware/errorHandler");
const User_1 = __importDefault(require("../../models/User"));
const TutorialVideo_1 = __importDefault(require("../../models/TutorialVideo"));
const router = (0, express_1.Router)();
const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        return next();
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
};
router.get('/', requireAuth_1.default, requireAdmin, async (_req, res) => {
    try {
        const videos = await TutorialVideo_1.default.find()
            .sort({ order: 1, createdAt: -1 })
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email');
        return res.status(200).json({
            success: true,
            data: videos
        });
    }
    catch (err) {
        console.error('Error fetching tutorial videos:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
router.get('/:id', requireAuth_1.default, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const video = await TutorialVideo_1.default.findById(id)
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
    }
    catch (err) {
        console.error('Error fetching tutorial video:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
router.post('/', requireAuth_1.default, requireAdmin, async (req, res) => {
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
        const userId = req.user.id;
        const video = new TutorialVideo_1.default({
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
    }
    catch (err) {
        console.error('Error creating tutorial video:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
router.put('/:id', requireAuth_1.default, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, videoUrl, category, order, thumbnailUrl, duration, isActive } = req.body;
        const video = await TutorialVideo_1.default.findById(id);
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
        const userId = req.user.id;
        if (title !== undefined)
            video.title = title;
        if (description !== undefined)
            video.description = description;
        if (videoUrl !== undefined)
            video.videoUrl = videoUrl;
        if (category !== undefined)
            video.category = category;
        if (order !== undefined)
            video.order = order;
        if (thumbnailUrl !== undefined)
            video.thumbnailUrl = thumbnailUrl;
        if (duration !== undefined)
            video.duration = duration;
        if (isActive !== undefined)
            video.isActive = isActive;
        video.updatedBy = userId;
        await video.save();
        return res.status(200).json({
            success: true,
            message: 'Tutorial video updated successfully',
            data: video
        });
    }
    catch (err) {
        console.error('Error updating tutorial video:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
router.delete('/:id', requireAuth_1.default, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const video = await TutorialVideo_1.default.findByIdAndDelete(id);
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
    }
    catch (err) {
        console.error('Error deleting tutorial video:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=tutorialVideos.js.map