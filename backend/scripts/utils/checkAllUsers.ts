import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import MessMembership from '../models/MessMembership';
import MessProfile from '../models/MessProfile';

dotenv.config();

const checkAllUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log('\n=== All Users ===');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (ID: ${user._id})`);
    });

    // Get all memberships
    const memberships = await MessMembership.find({});
    console.log('\n=== All Memberships ===');
    memberships.forEach(membership => {
      console.log(`- User: ${membership.userId}, Mess: ${membership.messId}, Status: ${membership.status}`);
    });

    // Check each user's membership
    console.log('\n=== User Memberships ===');
    for (const user of users) {
      const membership = await MessMembership.findOne({ userId: user._id });
      if (membership) {
        const mess = await MessProfile.findById(membership.messId);
        console.log(`✅ ${user.firstName} ${user.lastName} (${user._id})`);
        console.log(`   - Mess: ${mess?.name || 'Unknown'}`);
        console.log(`   - Status: ${membership.status}`);
        console.log(`   - Payment: ${membership.paymentStatus}`);
      } else {
        console.log(`❌ ${user.firstName} ${user.lastName} (${user._id}) - No membership`);
      }
    }

  } catch (error) {
    console.error('Error in check:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the check
checkAllUsers(); 