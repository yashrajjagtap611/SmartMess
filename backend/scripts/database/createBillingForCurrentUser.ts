import mongoose from 'mongoose';
import User from '../../src/models/User';
import MessProfile from '../../src/models/MessProfile';
import MessMembership from '../../src/models/MessMembership';
import MealPlan from '../../src/models/MealPlan';
import Billing from '../../src/models/Billing';
import Transaction from '../../src/models/Transaction';

const createBillingForCurrentUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find the current user (yashrajjagtap95@gmail.com)
    const currentUser = await User.findOne({ email: 'yashrajjagtap95@gmail.com' });
    if (!currentUser) {
      console.log('Current user not found. Please check the email address.');
      return;
    }
    console.log('Found current user:', currentUser.email);

    // Create a test mess for this user
    let testMess = await MessProfile.findOne({ userId: currentUser._id });
    if (!testMess) {
      testMess = new MessProfile({
        name: 'Royal Mess',
        location: {
          street: '456 Royal Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        colleges: ['Mumbai University', 'IIT Bombay'],
        ownerPhone: '9876543210',
        ownerEmail: currentUser.email,
        types: ['Mixed'],
        logo: null,
        operatingHours: [
          { meal: 'breakfast', enabled: true, start: '07:00', end: '09:00' },
          { meal: 'lunch', enabled: true, start: '12:00', end: '14:00' },
          { meal: 'dinner', enabled: true, start: '19:00', end: '21:00' }
        ],
        userId: currentUser._id
      });
      await testMess.save();
      console.log('Created test mess:', testMess.name);
    } else {
      console.log('Found existing mess:', testMess.name);
    }

    // Create multiple meal plans
    const mealPlans = [];
    
    // Monthly Plan
    let monthlyPlan = await MealPlan.findOne({ messId: testMess._id, name: 'Monthly Plan' });
    if (!monthlyPlan) {
      monthlyPlan = new MealPlan({
        messId: testMess._id.toString(),
        name: 'Monthly Plan',
        description: 'Monthly subscription plan with all meals included - perfect for regular students',
        mealType: 'Mixed',
        mealsPerDay: 3,
        pricing: {
          amount: 3500,
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
      await monthlyPlan.save();
      console.log('Created meal plan:', monthlyPlan.name);
    } else {
      console.log('Found existing meal plan:', monthlyPlan.name);
    }
    mealPlans.push(monthlyPlan);

    // Weekly Plan
    let weeklyPlan = await MealPlan.findOne({ messId: testMess._id, name: 'Weekly Plan' });
    if (!weeklyPlan) {
      weeklyPlan = new MealPlan({
        messId: testMess._id.toString(),
        name: 'Weekly Plan',
        description: 'Weekly subscription plan for short-term stays',
        mealType: 'Mixed',
        mealsPerDay: 3,
        pricing: {
          amount: 900,
          period: 'week'
        },
        mealOptions: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        isActive: true,
        leaveRules: {
          maxLeaveDays: 1,
          maxLeaveMeals: 2,
          requireTwoHourNotice: true,
          noticeHours: 2,
          minConsecutiveDays: 1,
          extendSubscription: false,
          autoApproval: false,
          leaveLimitsEnabled: true,
          consecutiveLeaveEnabled: true,
          maxLeaveDaysEnabled: true,
          maxLeaveMealsEnabled: true
        }
      });
      await weeklyPlan.save();
      console.log('Created meal plan:', weeklyPlan.name);
    } else {
      console.log('Found existing meal plan:', weeklyPlan.name);
    }
    mealPlans.push(weeklyPlan);

    // Create memberships for both plans
    for (const plan of mealPlans) {
      // Calculate subscription end date based on billing period
      const subscriptionStartDate = new Date();
      let subscriptionEndDate = new Date(subscriptionStartDate);
      
      // Calculate end date based on meal plan period
      switch(plan.pricing.period) {
        case 'day':
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 1);
          break;
        case 'week':
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 7);
          break;
        case '15days':
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 15);
          break;
        case 'month':
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
          break;
        case '3months':
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
          break;
        case '6months':
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
          break;
        case 'year':
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
          break;
        default:
          // Default to 30 days
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
      }
      
      let membership = await MessMembership.findOne({ userId: currentUser._id, messId: testMess._id, mealPlanId: plan._id });
      if (!membership) {
        membership = new MessMembership({
          userId: currentUser._id,
          messId: testMess._id,
          mealPlanId: plan._id,
          status: 'active',
          paymentStatus: plan.name === 'Monthly Plan' ? 'pending' : 'paid',
          paymentAmount: plan.pricing.amount,
          paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          subscriptionStartDate: subscriptionStartDate,
          subscriptionEndDate: subscriptionEndDate,
          autoRenewal: true
        });
        await membership.save();
        console.log(`Created membership for ${plan.name}`);
      } else {
        console.log(`Found existing membership for ${plan.name}`);
      }

      // Create billing records
      const existingBills = await Billing.find({ userId: currentUser._id, 'subscription.planName': plan.name });
      if (existingBills.length === 0) {
        // Create a pending bill
        const pendingBill = new Billing({
          userId: currentUser._id,
          messId: testMess._id,
          membershipId: membership._id,
          billingPeriod: {
            startDate: new Date(),
            endDate: new Date(Date.now() + (plan.pricing.period === 'month' ? 30 : 7) * 24 * 60 * 60 * 1000),
            period: plan.pricing.period === 'month' ? 'monthly' : 'weekly'
          },
          subscription: {
            planId: plan._id,
            planName: plan.name,
            baseAmount: plan.pricing.amount,
            discountAmount: 0,
            taxAmount: Math.round(plan.pricing.amount * 0.18), // 18% GST
            totalAmount: plan.pricing.amount + Math.round(plan.pricing.amount * 0.18)
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
            notes: `${plan.name} subscription bill`
          }
        });
        await pendingBill.save();
        console.log(`Created pending bill for ${plan.name}`);

        // Create a paid bill (previous period)
        const paidBill = new Billing({
          userId: currentUser._id,
          messId: testMess._id,
          membershipId: membership._id,
          billingPeriod: {
            startDate: new Date(Date.now() - (plan.pricing.period === 'month' ? 30 : 7) * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            period: plan.pricing.period === 'month' ? 'monthly' : 'weekly'
          },
          subscription: {
            planId: plan._id,
            planName: plan.name,
            baseAmount: plan.pricing.amount,
            discountAmount: 0,
            taxAmount: Math.round(plan.pricing.amount * 0.18),
            totalAmount: plan.pricing.amount + Math.round(plan.pricing.amount * 0.18)
          },
          payment: {
            status: 'paid',
            method: 'upi',
            dueDate: new Date(Date.now() - (plan.pricing.period === 'month' ? 23 : 5) * 24 * 60 * 60 * 1000),
            paidDate: new Date(Date.now() - (plan.pricing.period === 'month' ? 20 : 3) * 24 * 60 * 60 * 1000),
            transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          },
          adjustments: [],
          leaveCredits: [],
          metadata: {
            generatedBy: 'system',
            notes: `Previous ${plan.name} bill`
          }
        });
        await paidBill.save();
        console.log(`Created paid bill for ${plan.name}`);
      } else {
        console.log(`Found existing bills for ${plan.name}:`, existingBills.length);
      }

      // Create sample transactions
      const existingTransactions = await Transaction.find({ userId: currentUser._id, messId: testMess._id });
      if (existingTransactions.length === 0) {
        // Create a successful transaction
        const transaction = new Transaction({
          transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          userId: currentUser._id,
          messId: testMess._id,
          membershipId: membership._id,
          type: 'payment',
          amount: plan.pricing.amount + Math.round(plan.pricing.amount * 0.18),
          currency: 'INR',
          status: 'success',
          paymentMethod: 'upi',
          gateway: {
            name: 'razorpay',
            transactionId: 'RZP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            gatewayResponse: { status: 'captured' }
          },
          description: `${plan.name} payment for ${testMess.name}`,
          metadata: {
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            notes: 'Test payment'
          }
        });
        await transaction.save();
        console.log(`Created transaction record for ${plan.name}`);
      } else {
        console.log(`Found existing transactions:`, existingTransactions.length);
      }
    }

    console.log('\n=== BILLING DATA CREATED FOR CURRENT USER ===');
    console.log('User:', currentUser.email);
    console.log('Mess:', testMess.name);
    console.log('Plans:', mealPlans.map(p => p.name).join(', '));
    console.log('Bills: Multiple billing records created');
    console.log('Transactions: Payment records created');
    console.log('==============================================\n');

    console.log('Billing data ready for current user!');
  } catch (error) {
    console.error('Error creating billing data for current user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createBillingForCurrentUser();
