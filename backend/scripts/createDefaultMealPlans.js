const mongoose = require('mongoose');
require('dotenv').config();

// Since we're using TypeScript models, we'll create the schema directly
const defaultMealPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricing: {
    amount: { type: Number, required: true },
    period: { type: String, enum: ['day', 'week', '15days', 'month', '3months', '6months', 'year'], required: true }
  },
  mealType: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Custom', 'Vegan'], required: true },
  mealsPerDay: { type: Number, required: true },
  mealOptions: {
    breakfast: { type: Boolean, default: true },
    lunch: { type: Boolean, default: true },
    dinner: { type: Boolean, default: true }
  },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: true },
  leaveRules: {
    maxLeaveMeals: { type: Number, default: 30 },
    requireTwoHourNotice: { type: Boolean, default: true },
    noticeHours: { type: Number, default: 2 },
    minConsecutiveDays: { type: Number, default: 2 },
    extendSubscription: { type: Boolean, default: true },
    autoApproval: { type: Boolean, default: true },
    leaveLimitsEnabled: { type: Boolean, default: true },
    consecutiveLeaveEnabled: { type: Boolean, default: true },
    maxLeaveMealsEnabled: { type: Boolean, default: true }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'mess_owner', 'admin'], default: 'user' }
});

const DefaultMealPlan = mongoose.model('DefaultMealPlan', defaultMealPlanSchema);
const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const defaultMealPlans = [
  {
    name: "Basic Monthly Plan",
    pricing: {
      amount: 3000,
      period: "month"
    },
    mealType: "Mixed",
    mealsPerDay: 3,
    mealOptions: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    description: "A comprehensive monthly meal plan with 3 meals per day. Perfect for students looking for balanced nutrition.",
    isActive: true,
    isDefault: true,
    leaveRules: {
      maxLeaveMeals: 30,
      requireTwoHourNotice: true,
      noticeHours: 2,
      minConsecutiveDays: 2,
      extendSubscription: true,
      autoApproval: true,
      leaveLimitsEnabled: true,
      consecutiveLeaveEnabled: true,
      maxLeaveMealsEnabled: true
    }
  },
  {
    name: "Premium Monthly Plan",
    pricing: {
      amount: 4500,
      period: "month"
    },
    mealType: "Mixed",
    mealsPerDay: 3,
    mealOptions: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    description: "Premium monthly meal plan with high-quality ingredients and diverse menu options. Includes special dietary considerations.",
    isActive: true,
    isDefault: true,
    leaveRules: {
      maxLeaveDays: 15,
      maxLeaveMeals: 45,
      requireTwoHourNotice: true,
      noticeHours: 2,
      minConsecutiveDays: 1,
      extendSubscription: true,
      autoApproval: true,
      leaveLimitsEnabled: true,
      consecutiveLeaveEnabled: true,
      maxLeaveDaysEnabled: true,
      maxLeaveMealsEnabled: true
    }
  },
  {
    name: "Budget Weekly Plan",
    pricing: {
      amount: 800,
      period: "week"
    },
    mealType: "Mixed",
    mealsPerDay: 2,
    mealOptions: {
      breakfast: false,
      lunch: true,
      dinner: true
    },
    description: "Affordable weekly meal plan with 2 meals per day. Great for budget-conscious students.",
    isActive: true,
    isDefault: true,
    leaveRules: {
      maxLeaveDays: 5,
      maxLeaveMeals: 10,
      requireTwoHourNotice: true,
      noticeHours: 4,
      minConsecutiveDays: 3,
      extendSubscription: false,
      autoApproval: false,
      leaveLimitsEnabled: true,
      consecutiveLeaveEnabled: true,
      maxLeaveDaysEnabled: true,
      maxLeaveMealsEnabled: true
    }
  },
  {
    name: "Vegetarian Monthly Plan",
    pricing: {
      amount: 3500,
      period: "month"
    },
    mealType: "Vegetarian",
    mealsPerDay: 3,
    mealOptions: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    description: "Complete vegetarian meal plan with 3 nutritious meals per day. Includes protein-rich vegetarian options.",
    isActive: true,
    isDefault: true,
    leaveRules: {
      maxLeaveDays: 12,
      maxLeaveMeals: 36,
      requireTwoHourNotice: true,
      noticeHours: 2,
      minConsecutiveDays: 2,
      extendSubscription: true,
      autoApproval: true,
      leaveLimitsEnabled: true,
      consecutiveLeaveEnabled: true,
      maxLeaveDaysEnabled: true,
      maxLeaveMealsEnabled: true
    }
  }
];

async function createDefaultMealPlans() {
  try {
    console.log('Starting to create default meal plans...');

    // Find an admin user to set as createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating default meal plans without createdBy field.');
    }

    // Clear existing default meal plans
    await DefaultMealPlan.deleteMany({ isDefault: true });
    console.log('Cleared existing default meal plans.');

    // Create new default meal plans
    const createdPlans = [];
    for (const planData of defaultMealPlans) {
      const plan = new DefaultMealPlan({
        ...planData,
        createdBy: adminUser ? adminUser._id : null
      });
      
      const savedPlan = await plan.save();
      createdPlans.push(savedPlan);
      console.log(`Created default meal plan: ${savedPlan.name}`);
    }

    console.log(`\n✅ Successfully created ${createdPlans.length} default meal plans:`);
    createdPlans.forEach(plan => {
      console.log(`  - ${plan.name} (₹${plan.pricing.amount}/${plan.pricing.period})`);
    });

    console.log('\nThese default meal plans will be automatically generated for new mess owners when they create their mess profiles.');

  } catch (error) {
    console.error('Error creating default meal plans:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
createDefaultMealPlans();
