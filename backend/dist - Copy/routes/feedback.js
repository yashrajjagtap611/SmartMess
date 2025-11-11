"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const models_1 = require("../models");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// GET /api/feedback - Get feedback for a mess
router.get('/', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { dateRange = 'week', rating, search, page = 1, limit = 20 } = req.query;
        const userId = req.user.id;
        // Get user's mess ID (assuming user is mess owner)
        const user = await mongoose_1.default.model('User').findById(userId);
        if (!user || !user.messId) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found'
            });
        }
        const messId = user.messId;
        // Build date filter
        const now = new Date();
        let dateFilter = {};
        switch (dateRange) {
            case 'today':
                dateFilter = {
                    mealDate: {
                        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                    }
                };
                break;
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                dateFilter = { mealDate: { $gte: weekStart } };
                break;
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                dateFilter = { mealDate: { $gte: monthStart } };
                break;
        }
        // Build query
        const query = {
            messId,
            ...dateFilter
        };
        if (rating && rating !== 'all') {
            query.rating = parseInt(rating);
        }
        if (search) {
            query.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { comment: { $regex: search, $options: 'i' } }
            ];
        }
        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const feedback = await models_1.MealFeedback.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'firstName lastName email');
        const total = await models_1.MealFeedback.countDocuments(query);
        res.status(200).json({
            success: true,
            data: feedback,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (err) {
        console.error('Error fetching feedback:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/feedback/stats - Get feedback statistics
router.get('/stats', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { dateRange = 'week' } = req.query;
        const userId = req.user.id;
        // Get user's mess ID
        const user = await mongoose_1.default.model('User').findById(userId);
        if (!user || !user.messId) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found'
            });
        }
        const messId = user.messId;
        // Build date filter
        const now = new Date();
        let dateFilter = {};
        switch (dateRange) {
            case 'today':
                dateFilter = {
                    mealDate: {
                        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                    }
                };
                break;
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                dateFilter = { mealDate: { $gte: weekStart } };
                break;
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                dateFilter = { mealDate: { $gte: monthStart } };
                break;
        }
        const query = { messId, ...dateFilter };
        // Get statistics
        const totalFeedback = await models_1.MealFeedback.countDocuments(query);
        const averageRating = await models_1.MealFeedback.aggregate([
            { $match: query },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        const ratingDistribution = await models_1.MealFeedback.aggregate([
            { $match: query },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        const sentimentStats = await models_1.MealFeedback.aggregate([
            { $match: query },
            { $group: { _id: '$sentiment.label', count: { $sum: 1 } } }
        ]);
        const unresolvedCount = await models_1.MealFeedback.countDocuments({
            ...query,
            isResolved: false
        });
        return res.status(200).json({
            success: true,
            data: {
                totalFeedback,
                averageRating: averageRating[0]?.avgRating || 0,
                ratingDistribution,
                sentimentStats,
                unresolvedCount
            }
        });
    }
    catch (err) {
        console.error('Error fetching feedback stats:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/feedback/:feedbackId/respond - Respond to feedback
router.post('/:feedbackId/respond', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { feedbackId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Response message is required'
            });
        }
        const feedback = await models_1.MealFeedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        // Verify user owns the mess
        const user = await mongoose_1.default.model('User').findById(userId);
        if (!user || !user.messId || user.messId.toString() !== feedback.messId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this feedback'
            });
        }
        const response = {
            userId: userId,
            userName: `${user.firstName} ${user.lastName}`,
            comment: message.trim(),
            createdAt: new Date()
        };
        feedback.responses = feedback.responses || [];
        feedback.responses.push(response);
        await feedback.save();
        res.status(200).json({
            success: true,
            message: 'Response added successfully',
            data: {
                id: new mongoose_1.default.Types.ObjectId().toString(),
                userId: response.userId,
                userName: response.userName,
                comment: response.comment,
                createdAt: response.createdAt
            }
        });
    }
    catch (err) {
        console.error('Error responding to feedback:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// PUT /api/feedback/:feedbackId/resolve - Mark feedback as resolved
router.put('/:feedbackId/resolve', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { feedbackId } = req.params;
        const userId = req.user.id;
        const feedback = await models_1.MealFeedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        // Verify user owns the mess
        const user = await mongoose_1.default.model('User').findById(userId);
        if (!user || !user.messId || user.messId.toString() !== feedback.messId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this feedback'
            });
        }
        feedback.isResolved = true;
        await feedback.save();
        return res.status(200).json({
            success: true,
            message: 'Feedback marked as resolved'
        });
    }
    catch (err) {
        console.error('Error resolving feedback:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/feedback - Create new feedback (for users)
router.post('/', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { messId, mealType, mealDate, rating, comment } = req.body;
        const userId = req.user.id;
        // Validation
        if (!messId || !mealType || !mealDate || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        // Check if user is a member of this mess
        const membership = await mongoose_1.default.model('MessMembership').findOne({
            userId: userId,
            messId,
            status: 'active'
        });
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member of this mess to provide feedback'
            });
        }
        // Get user details
        const user = await mongoose_1.default.model('User').findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if feedback already exists for this user, meal, and date
        const existingFeedback = await models_1.MealFeedback.findOne({
            userId: userId,
            messId,
            mealType,
            mealDate: new Date(mealDate)
        });
        if (existingFeedback) {
            return res.status(409).json({
                success: false,
                message: 'Feedback already exists for this meal'
            });
        }
        // Create new feedback
        const feedback = new models_1.MealFeedback({
            userId: userId,
            userName: `${user.firstName} ${user.lastName}`,
            messId,
            mealType,
            mealDate: new Date(mealDate),
            rating,
            comment: comment.trim()
        });
        await feedback.save();
        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    }
    catch (err) {
        console.error('Error creating feedback:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=feedback.js.map