"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const TutorialVideo_1 = __importDefault(require("../models/TutorialVideo"));
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const videos = await TutorialVideo_1.default.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select('-createdBy -updatedBy -__v');
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
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!category || !['user', 'mess-owner', 'general'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Must be user, mess-owner, or general'
            });
        }
        const videos = await TutorialVideo_1.default.find({ category, isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select('-createdBy -updatedBy -__v');
        return res.status(200).json({
            success: true,
            data: videos
        });
    }
    catch (err) {
        console.error('Error fetching tutorial videos by category:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const video = await TutorialVideo_1.default.findOne({ _id: id, isActive: true })
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
    }
    catch (err) {
        console.error('Error fetching tutorial video:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=tutorialVideos.js.map