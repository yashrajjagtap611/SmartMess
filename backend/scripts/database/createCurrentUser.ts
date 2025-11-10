import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User';

const createCurrentUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Test password - you can use this to login
    const testPassword = 'Test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Create the current user
    const currentUser = {
      firstName: "YASHRAJ",
      lastName: "JAGTAP",
      email: "yashrajjagtap95@gmail.com",
      phone: "9876543210",
      password: hashedPassword,
      role: "user",
      isVerified: true,
      messPhotoUrl: null
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: currentUser.email });
    
    if (existingUser) {
      // Update the existing user with the new password
      await User.updateOne(
        { email: currentUser.email },
        { password: hashedPassword }
      );
      console.log('Updated existing user with new password');
    } else {
      // Create new user
      await User.create(currentUser);
      console.log('Created new user');
    }

    console.log('\n=== CURRENT USER CREDENTIALS ===');
    console.log(`Email: ${currentUser.email}`);
    console.log(`Password: ${testPassword}`);
    console.log('==============================\n');

    console.log('Current user ready for billing data creation!');
  } catch (error) {
    console.error('Error creating current user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createCurrentUser();
