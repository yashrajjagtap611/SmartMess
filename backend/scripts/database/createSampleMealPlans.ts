import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MessProfile from '../../src/models/MessProfile';
import MealPlan from '../../src/models/MealPlan';

dotenv.config();

const createSampleMealPlans = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get the mess
    const mess = await MessProfile.findOne({});
    if (!mess) {
      console.log('No mess found');
      return;
    }

    console.log('Found mess:', mess.name);

    // Check if meal plans already exist
    const existingPlans = await MealPlan.find({ messId: mess._id });
    if (existingPlans.length > 0) {
      console.log(`Mess already has ${existingPlans.length} meal plans`);
      existingPlans.forEach((plan: any) => {
        console.log(`- ${plan.name}: ₹${plan.pricing.amount} ${plan.pricing.period}`);
      });
      return;
    }

    // Create sample meal plans
    const samplePlans = [
      {
        messId: mess._id,
        name: 'Basic Monthly Plan',
        description: '2 meals per day - Breakfast and Dinner',
        pricing: {
          amount: 3000,
          period: 'month'
        },
        mealType: 'Veg',
        mealsPerDay: 2,
        isActive: true,
        leaveRules: {
          maxLeaveMeals: 10,
          requireTwoHourNotice: true,
          noticeHours: 2,
          minConsecutiveDays: 3,
          extendSubscription: true,
          autoApproval: false,
          leaveLimitsEnabled: true,
          consecutiveLeaveEnabled: true,
          maxLeaveMealsEnabled: true
        }
      },
      {
        messId: mess._id,
        name: 'Premium Monthly Plan',
        description: '3 meals per day - Breakfast, Lunch, and Dinner',
        pricing: {
          amount: 4500,
          period: 'month'
        },
        mealType: 'Mixed',
        mealsPerDay: 3,
        isActive: true,
        leaveRules: {
          maxLeaveMeals: 15,
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
        messId: mess._id,
        name: 'Weekly Trial Plan',
        description: '3 meals per day for 1 week - Perfect for trying out',
        pricing: {
          amount: 1200,
          period: 'week'
        },
        mealType: 'Veg',
        mealsPerDay: 3,
        isActive: true,
        leaveRules: {
          maxLeaveMeals: 6,
          requireTwoHourNotice: false,
          noticeHours: 0,
          minConsecutiveDays: 1,
          extendSubscription: false,
          autoApproval: true,
          leaveLimitsEnabled: true,
          consecutiveLeaveEnabled: false,
          maxLeaveMealsEnabled: true
        }
      }
    ];

    // Save meal plans
    for (const planData of samplePlans) {
      const plan = new MealPlan(planData);
      await plan.save();
      console.log(`✅ Created meal plan: ${plan.name} - ₹${plan.pricing.amount} ${plan.pricing.period}`);
    }

    console.log('\n=== All Meal Plans Created ===');
    const allPlans = await MealPlan.find({ messId: mess._id });
    allPlans.forEach((plan: any) => {
      console.log(`- ${plan.name}: ₹${plan.pricing.amount} ${plan.pricing.period} (${plan.mealType})`);
    });

  } catch (error) {
    console.error('Error creating meal plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createSampleMealPlans(); 