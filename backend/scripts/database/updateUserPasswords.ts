import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const updateUserPasswords = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Known password for all users
    const knownPassword = 'Password123';
    const hashedPassword = await bcrypt.hash(knownPassword, 10);

    // Update all users with the known password
    const result = await User.updateMany(
      { role: 'user' },
      { password: hashedPassword }
    );

    console.log(`Updated ${result.modifiedCount} users with new password`);
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log(`Password for all users: ${knownPassword}`);
    console.log('==========================\n');

    // List all users with their emails
    const users = await User.find({ role: 'user' }).select('firstName lastName email');
    console.log('Available users for login:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName}: ${user.email}`);
    });

    console.log('\nYou can now login with any of these emails using the password above!');
  } catch (error) {
    console.error('Error updating user passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the function
updateUserPasswords(); 