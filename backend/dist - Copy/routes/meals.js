"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const checkSubscription_1 = require("../middleware/checkSubscription");
const Meal_1 = __importDefault(require("../models/Meal"));
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const MessMembership_1 = __importDefault(require("../models/MessMembership"));
const router = (0, express_1.Router)();
// Configure multer for meal image uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads/meals');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `meal_${Date.now()}_${Math.random().toString(36).substring(7)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// GET /api/meals - Get all meals for the mess
router.get('/', requireAuth_1.default, async (req, res, _next) => {
    try {
        const userId = req.user.id;
        const messProfile = await MessProfile_1.default.findOne({ userId: req.user.id });
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found. Please create a mess profile first.'
            });
        }
        // Query parameters for filtering
        const { date, type, category, mealPlanId } = req.query;
        const filter = { messId: messProfile._id.toString() };
        // Add filters if provided
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }
        if (type) {
            filter.type = type;
        }
        if (category) {
            filter.category = category;
        }
        if (mealPlanId) {
            filter.associatedMealPlans = mealPlanId;
        }
        const meals = await Meal_1.default.find(filter).sort({ date: -1, createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: 'Meals retrieved successfully',
            data: meals
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/meals - Create a new meal
router.post('/', requireAuth_1.default, checkSubscription_1.checkCanAddMeals, upload.single('image'), async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const messProfile = await MessProfile_1.default.findOne({ userId: req.user.id });
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found. Please create a mess profile first.'
            });
        }
        const { name, description, type, category, categories, date, price, tags, associatedMealPlans, nutritionalInfo, allergens, preparationTime, servingSize } = req.body;
        // Validate required fields
        if (!name || !type || !date || !associatedMealPlans) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, type, date, associatedMealPlans'
            });
        }
        // Validate categories - either single category or categories array
        if (!category && (!categories || categories.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'At least one meal category is required'
            });
        }
        // Parse JSON fields if they're strings
        let parsedTags = [];
        let parsedMealPlans = [];
        let parsedNutritionalInfo = null;
        let parsedAllergens = [];
        let parsedCategories = [];
        try {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
            parsedMealPlans = typeof associatedMealPlans === 'string' ? JSON.parse(associatedMealPlans) : associatedMealPlans;
            parsedNutritionalInfo = typeof nutritionalInfo === 'string' ? JSON.parse(nutritionalInfo) : nutritionalInfo;
            parsedAllergens = typeof allergens === 'string' ? JSON.parse(allergens) : (allergens || []);
            parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : (categories || []);
        }
        catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format in request fields'
            });
        }
        // Handle image upload
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = `/uploads/meals/${req.file.filename}`;
        }
        const newMeal = new Meal_1.default({
            messId: messProfile._id.toString(),
            name,
            description,
            type,
            category: category || parsedCategories[0], // Use single category or first from array
            categories: parsedCategories.length > 0 ? parsedCategories : [category], // Use categories array or single category
            date: new Date(date),
            price: parseFloat(price) || 0,
            imageUrl,
            tags: parsedTags,
            associatedMealPlans: parsedMealPlans,
            nutritionalInfo: parsedNutritionalInfo,
            allergens: parsedAllergens,
            preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
            servingSize,
            isAvailable: true
        });
        const savedMeal = await newMeal.save();
        return res.status(201).json({
            success: true,
            message: 'Meal created successfully',
            data: savedMeal
        });
    }
    catch (err) {
        // Clean up uploaded file if meal creation fails
        if (req.file) {
            const filePath = path_1.default.join(__dirname, '../../uploads/meals', req.file.filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/meals/:id - Get a specific meal
router.get('/:id', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const messProfile = await MessProfile_1.default.findOne({ userId: req.user.id });
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found. Please create a mess profile first.'
            });
        }
        const meal = await Meal_1.default.findOne({
            _id: req.params['id'],
            messId: messProfile._id.toString()
        });
        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Meal retrieved successfully',
            data: meal
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// PUT /api/meals/:id - Update a meal
router.put('/:id', requireAuth_1.default, upload.single('image'), async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const messProfile = await MessProfile_1.default.findOne({ userId: req.user.id });
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found. Please create a mess profile first.'
            });
        }
        const existingMeal = await Meal_1.default.findOne({
            _id: req.params['id'],
            messId: messProfile._id.toString()
        });
        if (!existingMeal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found'
            });
        }
        const { name, description, type, category, categories, date, price, tags, associatedMealPlans, nutritionalInfo, allergens, preparationTime, servingSize, isAvailable } = req.body;
        // Parse JSON fields if they're strings
        let parsedTags = tags;
        let parsedMealPlans = associatedMealPlans;
        let parsedNutritionalInfo = nutritionalInfo;
        let parsedAllergens = allergens;
        let parsedCategories = categories;
        try {
            if (typeof tags === 'string')
                parsedTags = JSON.parse(tags);
            if (typeof associatedMealPlans === 'string')
                parsedMealPlans = JSON.parse(associatedMealPlans);
            if (typeof nutritionalInfo === 'string')
                parsedNutritionalInfo = JSON.parse(nutritionalInfo);
            if (typeof allergens === 'string')
                parsedAllergens = JSON.parse(allergens);
            if (typeof categories === 'string')
                parsedCategories = JSON.parse(categories);
        }
        catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format in request fields'
            });
        }
        // Handle image upload
        let imageUrl = existingMeal.imageUrl;
        if (req.file) {
            // Delete old image if it exists
            if (existingMeal.imageUrl) {
                const oldImagePath = path_1.default.join(__dirname, '../..', existingMeal.imageUrl);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
            }
            imageUrl = `/uploads/meals/${req.file.filename}`;
        }
        // Update meal
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (type !== undefined)
            updateData.type = type;
        if (category !== undefined)
            updateData.category = category;
        if (parsedCategories !== undefined) {
            updateData.categories = parsedCategories;
            // Also update single category for backward compatibility
            if (parsedCategories.length > 0) {
                updateData.category = parsedCategories[0];
            }
        }
        if (date !== undefined)
            updateData.date = new Date(date);
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (imageUrl !== undefined)
            updateData.imageUrl = imageUrl;
        if (parsedTags !== undefined)
            updateData.tags = parsedTags;
        if (parsedMealPlans !== undefined)
            updateData.associatedMealPlans = parsedMealPlans;
        if (parsedNutritionalInfo !== undefined)
            updateData.nutritionalInfo = parsedNutritionalInfo;
        if (parsedAllergens !== undefined)
            updateData.allergens = parsedAllergens;
        if (preparationTime !== undefined)
            updateData.preparationTime = parseInt(preparationTime);
        if (servingSize !== undefined)
            updateData.servingSize = servingSize;
        if (isAvailable !== undefined)
            updateData.isAvailable = isAvailable;
        const updatedMeal = await Meal_1.default.findByIdAndUpdate(req.params['id'], updateData, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            message: 'Meal updated successfully',
            data: updatedMeal
        });
    }
    catch (err) {
        // Clean up uploaded file if meal update fails
        if (req.file) {
            const filePath = path_1.default.join(__dirname, '../../uploads/meals', req.file.filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// DELETE /api/meals/:id - Delete a meal
router.delete('/:id', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const messProfile = await MessProfile_1.default.findOne({ userId: req.user.id });
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found. Please create a mess profile first.'
            });
        }
        const meal = await Meal_1.default.findOne({
            _id: req.params['id'],
            messId: messProfile._id.toString()
        });
        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found'
            });
        }
        // Delete associated image file if it exists
        if (meal.imageUrl) {
            const imagePath = path_1.default.join(__dirname, '../..', meal.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        await Meal_1.default.findByIdAndDelete(req.params['id']);
        return res.status(200).json({
            success: true,
            message: 'Meal deleted successfully'
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/meals/date/:date - Get meals for a specific date
router.get('/date/:date', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const messProfile = await MessProfile_1.default.findOne({ userId: req.user.id });
        if (!messProfile) {
            return res.status(404).json({
                success: false,
                message: 'Mess profile not found. Please create a mess profile first.'
            });
        }
        const dateParam = req.params['date'];
        if (!dateParam) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }
        const targetDate = new Date(dateParam);
        const startDate = new Date(targetDate);
        const endDate = new Date(targetDate);
        endDate.setDate(startDate.getDate() + 1);
        const meals = await Meal_1.default.find({
            messId: messProfile._id.toString(),
            date: { $gte: startDate, $lt: endDate }
        }).sort({ type: 1, createdAt: -1 });
        // Group meals by type for easier frontend consumption
        const groupedMeals = {
            breakfast: meals.filter(meal => meal.type === 'breakfast'),
            lunch: meals.filter(meal => meal.type === 'lunch'),
            dinner: meals.filter(meal => meal.type === 'dinner')
        };
        return res.status(200).json({
            success: true,
            message: 'Meals retrieved successfully',
            data: {
                date: req.params['date'],
                meals: groupedMeals,
                total: meals.length
            }
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/meals/user/today - Get today's menu for user based on their subscriptions
router.get('/user/today', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        // Get user's meal plan subscriptions
        const subscriptions = await MessMembership_1.default.find({
            userId,
            status: 'active'
        }).populate([
            { path: 'mealPlanId', select: 'name' },
            { path: 'messId', select: 'name' }
        ]);
        console.log('Found subscriptions:', subscriptions.length);
        console.log('Subscription details:', subscriptions.map(sub => ({
            id: sub._id,
            mealPlanId: sub.mealPlanId,
            messId: sub.messId,
            hasMealPlan: !!sub.mealPlanId,
            hasMess: !!sub.messId
        })));
        if (!subscriptions || subscriptions.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No active meal plan subscriptions found'
            });
        }
        // Create a map of valid meal plan IDs for each mess
        const validMealPlansByMess = new Map();
        subscriptions.forEach((sub) => {
            if (sub.mealPlanId && sub.mealPlanId._id && sub.messId && sub.messId._id) {
                const messId = sub.messId._id.toString();
                const mealPlanId = sub.mealPlanId._id.toString();
                if (!validMealPlansByMess.has(messId)) {
                    validMealPlansByMess.set(messId, {
                        messName: sub.messId.name,
                        mealPlanIds: [],
                        mealPlanNames: []
                    });
                }
                validMealPlansByMess.get(messId).mealPlanIds.push(mealPlanId);
                validMealPlansByMess.get(messId).mealPlanNames.push(sub.mealPlanId.name);
            }
        });
        console.log('Valid meal plans by mess:', Object.fromEntries(validMealPlansByMess));
        // Get all mess IDs that the user has subscriptions for
        const messIds = Array.from(validMealPlansByMess.keys());
        if (messIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No valid mess subscriptions found'
            });
        }
        // Get today's meals for the user's subscribed messes
        const meals = await Meal_1.default.find({
            messId: { $in: messIds },
            date: {
                $gte: new Date(todayString + 'T00:00:00.000Z'),
                $lt: new Date(todayString + 'T23:59:59.999Z')
            },
            isAvailable: true
        });
        console.log('Total meals found for today:', meals.length);
        // Filter and format meals to ONLY include those from user's subscribed meal plans
        const formattedMeals = [];
        for (const meal of meals) {
            const messId = meal.messId;
            const messInfo = validMealPlansByMess.get(messId);
            if (!messInfo) {
                console.log(`Skipping meal ${meal._id} - mess ${messId} not in user subscriptions`);
                continue;
            }
            console.log(`Processing meal: ${meal.name} from mess: ${messInfo.messName}`);
            // Check if this meal is associated with any of the user's subscribed meal plans
            const mealAssociatedPlans = meal.associatedMealPlans || [];
            const hasValidMealPlan = mealAssociatedPlans.some((planId) => messInfo.mealPlanIds.includes(planId));
            if (hasValidMealPlan) {
                // Find the specific meal plan name for this meal
                let mealPlanName = 'Unknown Plan';
                for (let i = 0; i < messInfo.mealPlanIds.length; i++) {
                    if (mealAssociatedPlans.includes(messInfo.mealPlanIds[i])) {
                        mealPlanName = messInfo.mealPlanNames[i];
                        break;
                    }
                }
                console.log(`✅ Meal ${meal._id} directly associated with user's meal plan: ${mealPlanName}`);
                console.log(`✅ INCLUDING: ${meal.name} from ${messInfo.messName}, plan ${mealPlanName}`);
                // Only include meals that are directly associated with user's subscription
                formattedMeals.push({
                    id: meal._id,
                    name: meal.name,
                    description: meal.description,
                    type: meal.type,
                    category: meal.category,
                    categories: meal.categories,
                    imageUrl: meal.imageUrl,
                    tags: meal.tags,
                    messName: messInfo.messName,
                    mealPlanName: mealPlanName
                });
            }
            else {
                // Meal is NOT associated with user's meal plans - SKIP IT
                console.log(`❌ SKIPPING: ${meal.name} - not associated with user's meal plans`);
                console.log(`   - Meal's plans: ${mealAssociatedPlans}`);
                console.log(`   - User's plans: ${messInfo.mealPlanIds}`);
                console.log(`   - This meal will NOT be shown to user`);
                // Don't add this meal to formattedMeals - user doesn't subscribe to it
            }
        }
        console.log(`Final formatted meals: ${formattedMeals.length}`);
        return res.status(200).json({
            success: true,
            data: formattedMeals,
            message: `Found ${formattedMeals.length} meals for today`
        });
    }
    catch (err) {
        console.error('Error fetching user today\'s menu:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=meals.js.map