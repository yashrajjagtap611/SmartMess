const mongoose = require('mongoose');
const User = require('./src/models/User');
const MessProfile = require('./src/models/MessProfile');
const MessMembership = require('./src/models/MessMembership');
const Notification = require('./src/models/Notification');
const MealPlan = require('./src/models/MealPlan');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartmess', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Test notification creation and retrieval
async function testNotifications() {
  console.log('\n🔔 Testing Notification System...');
  
  try {
    // Find a mess owner
    const messOwner = await User.findOne({ role: 'mess-owner' });
    if (!messOwner) {
      console.log('❌ No mess owner found');
      return;
    }
    
    console.log(`📋 Found mess owner: ${messOwner.firstName} ${messOwner.lastName} (${messOwner._id})`);
    
    // Find their mess profile
    const messProfile = await MessProfile.findOne({ userId: messOwner._id });
    if (!messProfile) {
      console.log('❌ No mess profile found for owner');
      return;
    }
    
    console.log(`🏠 Found mess: ${messProfile.name} (${messProfile._id})`);
    
    // Find a regular user
    const regularUser = await User.findOne({ role: 'user' });
    if (!regularUser) {
      console.log('❌ No regular user found');
      return;
    }
    
    console.log(`👤 Found regular user: ${regularUser.firstName} ${regularUser.lastName} (${regularUser._id})`);
    
    // Find a meal plan
    const mealPlan = await MealPlan.findOne({ messId: messProfile._id });
    if (!mealPlan) {
      console.log('❌ No meal plan found');
      return;
    }
    
    console.log(`🍽️ Found meal plan: ${mealPlan.name} (${mealPlan._id})`);
    
    // Test 1: Create a join request notification
    console.log('\n📝 Test 1: Creating join request notification...');
    const joinNotification = new Notification({
      userId: messOwner._id,
      messId: messProfile._id,
      type: 'join_request',
      title: 'New Join Request',
      message: `${regularUser.firstName} ${regularUser.lastName} wants to join your mess`,
      status: 'pending',
      data: {
        requestingUserId: regularUser._id,
        requestingUserName: `${regularUser.firstName} ${regularUser.lastName}`,
        mealPlanId: mealPlan._id,
        paymentType: 'pay_later',
        amount: mealPlan.pricing.amount,
        plan: mealPlan.name
      },
      isRead: false
    });
    
    await joinNotification.save();
    console.log(`✅ Join request notification created: ${joinNotification._id}`);
    
    // Test 2: Create a payment request notification
    console.log('\n💰 Test 2: Creating payment request notification...');
    const paymentNotification = new Notification({
      userId: messOwner._id,
      messId: messProfile._id,
      type: 'payment_request',
      title: 'Payment Request',
      message: `${regularUser.firstName} ${regularUser.lastName} has completed UPI payment for mess subscription`,
      status: 'pending',
      data: {
        requestingUserId: regularUser._id,
        requestingUserName: `${regularUser.firstName} ${regularUser.lastName}`,
        mealPlanId: mealPlan._id,
        paymentType: 'pay_now',
        amount: mealPlan.pricing.amount,
        plan: mealPlan.name
      },
      isRead: false
    });
    
    await paymentNotification.save();
    console.log(`✅ Payment request notification created: ${paymentNotification._id}`);
    
    // Test 3: Retrieve notifications for mess owner
    console.log('\n📥 Test 3: Retrieving notifications for mess owner...');
    const ownerNotifications = await Notification.find({ userId: messOwner._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`📊 Found ${ownerNotifications.length} notifications for mess owner:`);
    ownerNotifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.type} - ${notif.title} (${notif.status})`);
    });
    
    // Test 4: Test membership creation
    console.log('\n👥 Test 4: Testing membership creation...');
    
    // Check existing memberships
    const existingMembership = await MessMembership.findOne({
      userId: regularUser._id,
      messId: messProfile._id,
      mealPlanId: mealPlan._id
    });
    
    if (existingMembership) {
      console.log(`⚠️ Existing membership found: ${existingMembership.status} (${existingMembership.paymentStatus})`);
    } else {
      console.log('✅ No existing membership found, creating new one...');
      
      // Calculate subscription end date based on billing period
      const subscriptionStartDate = new Date();
      let subscriptionEndDate = new Date(subscriptionStartDate);
      
      // Calculate end date based on meal plan period
      switch(mealPlan.pricing.period) {
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
      
      const newMembership = new MessMembership({
        userId: regularUser._id,
        messId: messProfile._id,
        mealPlanId: mealPlan._id,
        status: 'pending',
        paymentStatus: 'pending',
        paymentType: 'pay_later',
        paymentAmount: mealPlan.pricing.amount,
        paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate,
        reminderSentCount: 0,
        autoRenewal: true,
        paymentHistory: []
      });
      
      await newMembership.save();
      console.log(`✅ New membership created: ${newMembership._id}`);
    }
    
    // Test 5: Test notification approval flow
    console.log('\n✅ Test 5: Testing notification approval...');
    
    // Approve the join request
    const notificationToApprove = await Notification.findOne({
      userId: messOwner._id,
      type: 'join_request',
      status: 'pending'
    });
    
    if (notificationToApprove) {
      console.log(`📋 Approving notification: ${notificationToApprove._id}`);
      
      // Update notification status
      notificationToApprove.status = 'approved';
      notificationToApprove.isRead = true;
      await notificationToApprove.save();
      
      // Update membership status
      const membershipToUpdate = await MessMembership.findOne({
        userId: notificationToApprove.data.requestingUserId,
        messId: notificationToApprove.messId,
        mealPlanId: notificationToApprove.data.mealPlanId
      });
      
      if (membershipToUpdate) {
        membershipToUpdate.status = 'active';
        membershipToUpdate.paymentStatus = notificationToApprove.data.paymentType === 'pay_now' ? 'paid' : 'pending';
        if (notificationToApprove.data.paymentType === 'pay_now') {
          membershipToUpdate.lastPaymentDate = new Date();
        }
        await membershipToUpdate.save();
        console.log(`✅ Membership updated to active`);
      }
      
      // Create user notification
      const userNotification = new Notification({
        userId: notificationToApprove.data.requestingUserId,
        messId: notificationToApprove.messId,
        type: 'join_request',
        title: 'Join Request Approved',
        message: `Your request to join the mess has been approved! Welcome to the community.`,
        status: 'completed',
        data: {
          messId: notificationToApprove.messId,
          approvedBy: messOwner._id,
          approvedAt: new Date().toISOString(),
          paymentType: notificationToApprove.data.paymentType
        },
        isRead: false
      });
      
      await userNotification.save();
      console.log(`✅ User notification created: ${userNotification._id}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...');
  
  const baseURL = 'http://localhost:3000/api';
  
  try {
    // Test 1: Get notifications endpoint
    console.log('\n📥 Test 1: GET /notifications');
    
    // You would need to make actual HTTP requests here
    // For now, just log what should be tested
    console.log('✅ Should test: GET /notifications with proper auth headers');
    console.log('✅ Should test: PUT /notifications/:id/action with approve/reject');
    console.log('✅ Should test: PUT /notifications/:id/read');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Notification System Tests...');
  
  await connectDB();
  await testNotifications();
  await testAPIEndpoints();
  
  console.log('\n✅ All tests completed!');
  process.exit(0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});