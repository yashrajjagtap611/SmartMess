import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MessProfile from '../models/MessProfile';
import User from '../models/User';
import MessMembership from '../models/MessMembership';
import Notification from '../models/Notification';
import MealPlan from '../models/MealPlan';

dotenv.config();

const debugMembership = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all users and messes
    const users = await User.find({});
    const messes = await MessProfile.find({});
    const memberships = await MessMembership.find({});
    const notifications = await Notification.find({});

    console.log('\n=== Database Overview ===');
    console.log('Users:', users.length);
    console.log('Messes:', messes.length);
    console.log('Memberships:', memberships.length);
    console.log('Notifications:', notifications.length);

    // Show all users
    console.log('\n=== Users ===');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (ID: ${user._id})`);
    });

    // Show all messes
    console.log('\n=== Messes ===');
    messes.forEach(mess => {
      console.log(`- ${mess.name} (Owner: ${mess.userId})`);
    });

    // Show all memberships
    console.log('\n=== Memberships ===');
    memberships.forEach(membership => {
      console.log(`- User: ${membership.userId}, Mess: ${membership.messId}, Status: ${membership.status}, Payment: ${membership.paymentStatus}`);
    });

    // Check specific user membership
    const testUser = users[0];
    if (testUser) {
      console.log(`\n=== Checking Membership for ${testUser.firstName} ${testUser.lastName} ===`);
      
      const userMembership = await MessMembership.findOne({ userId: testUser._id })
        .populate('messId', 'name');

      if (userMembership) {
        console.log('Membership found:', {
          status: userMembership.status,
          paymentStatus: userMembership.paymentStatus,
          messName: (userMembership.messId as any)?.name,
          joinDate: userMembership.joinDate,
          mealPlanId: userMembership.mealPlanId
        });
      } else {
        console.log('No membership found for this user');
      }

      // Check user notifications
      const userNotifications = await Notification.find({ userId: testUser._id });
      console.log(`User notifications: ${userNotifications.length}`);
      userNotifications.forEach(notif => {
        console.log(`- ${notif.title}: ${notif.status}`);
      });
    }

    // Test the user-details endpoint logic
    console.log('\n=== Testing User Details Logic ===');
    const testUserId = testUser?._id;
    if (testUserId) {
      const membership = await MessMembership.findOne({ userId: testUserId })
        .populate('messId', 'name location');

      if (membership) {
        console.log('Membership found for API:', {
          messId: membership.messId._id.toString(),
          messName: (membership.messId as any).name,
          status: membership.status,
          mealPlanId: membership.mealPlanId
        });
      } else {
        console.log('No membership found for API');
      }
    }

  } catch (error) {
    console.error('Error in debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the debug
debugMembership(); 