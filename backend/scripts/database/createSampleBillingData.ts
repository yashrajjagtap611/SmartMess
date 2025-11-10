import mongoose from 'mongoose';
import User from '../../src/models/User';
import MessProfile from '../../src/models/MessProfile';
import MessMembership from '../../src/models/MessMembership';
import MealPlan from '../../src/models/MealPlan';
import Billing from '../../src/models/Billing';
import Transaction from '../../src/models/Transaction';

const createSampleBillingData = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find the test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('Test user not found. Please run createTestUser.ts first.');
      return;
    }
    console.log('Found test user:', testUser.email);

    // Create a test mess
    let testMess = await MessProfile.findOne({ userId: testUser._id });
    if (!testMess) {
      testMess = new MessProfile({
        name: 'Green Leaf Mess',
        location: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          country: 'India'
        },
        colleges: ['Test University'],
        ownerPhone: '9876543210',
        ownerEmail: 'greenleaf@test.com',
        types: ['Veg'],
        logo: null,
        operatingHours: [
          { meal: 'breakfast', enabled: true, start: '07:00', end: '09:00' },
          { meal: 'lunch', enabled: true, start: '12:00', end: '14:00' },
          { meal: 'dinner', enabled: true, start: '19:00', end: '21:00' }
        ],
        userId: testUser._id
      });
      await testMess.save();
      console.log('Created test mess:', testMess.name);
    } else {
      console.log('Found existing mess:', testMess.name);
    }

    // Create a meal plan
    let mealPlan = await MealPlan.findOne({ messId: testMess._id });
    if (!mealPlan) {
      mealPlan = new MealPlan({
        messId: testMess._id.toString(),
        name: 'Monthly Plan',
        description: 'Monthly subscription plan with all meals included',
        mealType: 'Vegetarian',
        mealsPerDay: 3,
        pricing: {
          amount: 2500,
          period: 'month'
        },
        mealOptions: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        isActive: true,
        leaveRules: {
          maxLeaveMeals: 8,
          requireTwoHourNotice: true,
          noticeHours: 2,
          minConsecutiveDays: 1,
          extendSubscription: false,
          autoApproval: false,
          leaveLimitsEnabled: true,
          consecutiveLeaveEnabled: true,
          maxLeaveMealsEnabled: true
        }
      });
      await mealPlan.save();
      console.log('Created meal plan:', mealPlan.name);
    } else {
      console.log('Found existing meal plan:', mealPlan.name);
    }

    // Create a membership
    let membership = await MessMembership.findOne({ userId: testUser._id, messId: testMess._id });
    if (!membership) {
      // Calculate subscription end date based on billing period
      const subscriptionStartDate = new Date();
      let subscriptionEndDate = new Date(subscriptionStartDate);
      
      // Calculate end date based on meal plan period (assuming monthly)
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      
      membership = new MessMembership({
        userId: testUser._id,
        messId: testMess._id,
        mealPlanId: mealPlan._id,
        status: 'active',
        paymentStatus: 'pending',
        paymentAmount: 2500,
        paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate,
        autoRenewal: true
      });
      await membership.save();
      console.log('Created membership for user');
    } else {
      console.log('Found existing membership');
    }

    // Create sample billing records
    const existingBills = await Billing.find({ userId: testUser._id });
    if (existingBills.length === 0) {
      // Create a pending bill
      const pendingBill = new Billing({
        userId: testUser._id,
        messId: testMess._id,
        membershipId: membership._id,
        billingPeriod: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          period: 'monthly'
        },
        subscription: {
          planId: mealPlan._id,
          planName: mealPlan.name,
          baseAmount: 2500,
          discountAmount: 0,
          taxAmount: 450,
          totalAmount: 2950
        },
        payment: {
          status: 'pending',
          method: 'upi',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        adjustments: [],
        leaveCredits: [],
        metadata: {
          generatedBy: 'system',
          notes: 'Monthly subscription bill'
        }
      });
      await pendingBill.save();
      console.log('Created pending bill');

      // Create a paid bill
      const paidBill = new Billing({
        userId: testUser._id,
        messId: testMess._id,
        membershipId: membership._id,
        billingPeriod: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          period: 'monthly'
        },
        subscription: {
          planId: mealPlan._id,
          planName: mealPlan.name,
          baseAmount: 2500,
          discountAmount: 0,
          taxAmount: 450,
          totalAmount: 2950
        },
        payment: {
          status: 'paid',
          method: 'upi',
          dueDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          transactionId: 'TXN_' + Date.now()
        },
        adjustments: [],
        leaveCredits: [],
        metadata: {
          generatedBy: 'system',
          notes: 'Previous month bill'
        }
      });
      await paidBill.save();
      console.log('Created paid bill');
    } else {
      console.log('Found existing bills:', existingBills.length);
    }

    // Create sample transactions
    const existingTransactions = await Transaction.find({ userId: testUser._id });
    if (existingTransactions.length === 0) {
      // Create a successful transaction
      const transaction = new Transaction({
        transactionId: 'TXN_' + Date.now(),
        userId: testUser._id,
        messId: testMess._id,
        membershipId: membership._id,
        type: 'payment',
        amount: 2950,
        currency: 'INR',
        status: 'success',
        paymentMethod: 'upi',
        gateway: {
          name: 'razorpay',
          transactionId: 'RZP_' + Date.now(),
          gatewayResponse: { status: 'captured' }
        },
        description: 'Monthly subscription payment for Green Leaf Mess',
        metadata: {
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          notes: 'Test payment'
        }
      });
      await transaction.save();
      console.log('Created transaction record');
    } else {
      console.log('Found existing transactions:', existingTransactions.length);
    }

    console.log('\n=== SAMPLE DATA CREATED ===');
    console.log('User:', testUser.email);
    console.log('Mess:', testMess.name);
    console.log('Plan:', mealPlan.name);
    console.log('Bills: Check database for billing records');
    console.log('Transactions: Check database for transaction records');
    console.log('==============================\n');

    console.log('Sample billing data ready!');
  } catch (error) {
    console.error('Error creating sample billing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleBillingData();
