import mongoose from 'mongoose';
import User from '../models/User';

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check total number of users
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    // Find the specific user
    const specificUser = await User.findOne({ email: 'nehadahake27@gmail.com' });
    
    if (specificUser) {
      console.log('\n✅ User found:');
      console.log(`- Name: ${specificUser.firstName} ${specificUser.lastName}`);
      console.log(`- Email: ${specificUser.email}`);
      console.log(`- Role: ${specificUser.role}`);
      console.log(`- Verified: ${specificUser.isVerified}`);
      console.log(`- Created: ${specificUser.createdAt}`);
    } else {
      console.log('\n❌ User not found: nehadahake27@gmail.com');
    }

    // List all users
    const allUsers = await User.find({}).select('firstName lastName email role isVerified');
    console.log('\n📋 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - Verified: ${user.isVerified}`);
    });

    // Test database connection
    console.log('\n🔍 Testing database connection...');
    const testResult = await mongoose.connection.db.admin().ping();
    console.log(`Database ping result: ${testResult.ok ? '✅ Success' : '❌ Failed'}`);

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the function
checkUsers(); 