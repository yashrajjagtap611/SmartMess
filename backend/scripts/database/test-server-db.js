const mongoose = require('mongoose');

async function testServerDB() {
  try {
    // Use the same connection string as the server
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    console.log('Connecting to:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Test the exact same query the login route uses
    const User = mongoose.model('User', new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      password: String,
      role: String,
      isVerified: Boolean,
      messPhotoUrl: String
    }));

    const normalizedEmail = 'nehadahake27@gmail.com'.toLowerCase();
    console.log('Looking for email:', normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      console.log('✅ User found in database:');
      console.log(`- Name: ${user.firstName} ${user.lastName}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Verified: ${user.isVerified}`);
    } else {
      console.log('❌ User NOT found in database');
      
      // Let's check what users are actually in the database
      const allUsers = await User.find({}).select('email');
      console.log('\n📋 All emails in database:');
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testServerDB(); 