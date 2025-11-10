import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User';

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Test password - you can use this to login
    const testPassword = 'Test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Create a test user
    const testUser = {
      firstName: "TEST",
      lastName: "USER",
      email: "test@example.com",
      phone: "1234567890",
      password: hashedPassword,
      role: "user",
      isVerified: true,
      messPhotoUrl: null
    };

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    
    if (existingUser) {
      // Update the existing user with the new password
      await User.updateOne(
        { email: testUser.email },
        { password: hashedPassword }
      );
      console.log('Updated existing test user with new password');
    } else {
      // Create new test user
      await User.create(testUser);
      console.log('Created new test user');
    }

    console.log('\n=== TEST USER CREDENTIALS ===');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testPassword}`);
    console.log('==============================\n');

    console.log('Test user ready for login testing!');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the function
createTestUser(); 