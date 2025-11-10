const mongoose = require('mongoose');

async function debugLogin() {
  try {
    // Use the same connection string as the server
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    console.log('Connecting to:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Use the exact same User model as the server
    const UserSchema = new mongoose.Schema({
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, trim: true, lowercase: true },
      phone: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'mess-owner', 'admin'], required: true },
      isVerified: { type: Boolean, default: false },
      messPhotoUrl: { type: String, default: null },
    }, { timestamps: true });

    UserSchema.index({ email: 1 });
    const User = mongoose.model('User', UserSchema);

    const normalizedEmail = 'nehadahake27@gmail.com'.toLowerCase();
    console.log('Looking for email:', normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      console.log('✅ User found in database:');
      console.log(`- Name: ${user.firstName} ${user.lastName}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Verified: ${user.isVerified}`);
      console.log(`- Created: ${user.createdAt}`);
    } else {
      console.log('❌ User NOT found in database');
      
      // Let's check what users are actually in the database
      const allUsers = await User.find({}).select('email');
      console.log('\n📋 All emails in database:');
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email}`);
      });
    }

    // Test with different case
    console.log('\n🔍 Testing with different case...');
    const userCaseInsensitive = await User.findOne({ 
      email: { $regex: new RegExp('^nehadahake27@gmail.com$', 'i') }
    });
    
    if (userCaseInsensitive) {
      console.log('✅ User found with case-insensitive search');
    } else {
      console.log('❌ User not found with case-insensitive search');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugLogin(); 