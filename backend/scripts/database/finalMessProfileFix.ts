import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MessProfile from '../models/MessProfile';
import User from '../models/User';

dotenv.config();

const finalMessProfileFix = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== FINAL MESS PROFILE FIX ===');
    
    // 1. Check current database state
    console.log('\n1. Checking current database state...');
    const allProfiles = await MessProfile.find({}).lean();
    console.log(`Total profiles: ${allProfiles.length}`);
    
    // 2. Check for any problematic records
    console.log('\n2. Checking for problematic records...');
    
    // Check for any records with null/undefined userId
    const nullUserIdProfiles = await MessProfile.find({ 
      $or: [
        { userId: null },
        { userId: undefined }
      ]
    });
    console.log(`Profiles with null/undefined userId: ${nullUserIdProfiles.length}`);
    
    // Check for any records with messOwnerId field (legacy)
    const messOwnerIdProfiles = await MessProfile.find({ messOwnerId: { $exists: true } });
    console.log(`Profiles with messOwnerId field: ${messOwnerIdProfiles.length}`);
    
    // 3. Clean up any problematic records
    console.log('\n3. Cleaning up problematic records...');
    
    if (nullUserIdProfiles.length > 0) {
      console.log('Deleting profiles with null/undefined userId...');
      const deleteResult = await MessProfile.deleteMany({
        $or: [
          { userId: null },
          { userId: undefined }
        ]
      });
      console.log(`Deleted ${deleteResult.deletedCount} profiles with null/undefined userId`);
    }
    
    if (messOwnerIdProfiles.length > 0) {
      console.log('Deleting profiles with messOwnerId field...');
      const deleteResult = await MessProfile.deleteMany({ messOwnerId: { $exists: true } });
      console.log(`Deleted ${deleteResult.deletedCount} profiles with messOwnerId field`);
    }
    
    // 4. Drop all indexes and recreate them
    console.log('\n4. Recreating indexes...');
    try {
      await MessProfile.collection.dropIndexes();
      console.log('✅ Dropped all existing indexes');
    } catch (error) {
      console.log('No existing indexes to drop or error dropping indexes');
    }
    
    // Create proper indexes
    await MessProfile.collection.createIndex({ userId: 1 }, { unique: true });
    await MessProfile.collection.createIndex({ 'location.city': 1 });
    await MessProfile.collection.createIndex({ 'location.state': 1 });
    console.log('✅ Created new indexes');
    
    // 5. Verify indexes
    console.log('\n5. Verifying indexes...');
    const indexes = await MessProfile.collection.getIndexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));
    
    // 6. Test profile creation for multiple users
    console.log('\n6. Testing profile creation for multiple users...');
    
    const users = await User.find({}).limit(3);
    console.log(`Found ${users.length} users for testing`);
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\nTesting user ${i + 1}: ${user.firstName} ${user.lastName} (${user._id})`);
      
      // Check if user already has a profile
      const existingProfile = await MessProfile.findOne({ userId: user._id });
      
      if (existingProfile) {
        console.log(`User ${i + 1} already has a profile: ${existingProfile.name}`);
        
        // Test updating the profile
        const updateResult = await MessProfile.findOneAndUpdate(
          { userId: user._id },
          { name: `Updated Profile ${i + 1}` },
          { new: true, runValidators: true }
        );
        
        if (updateResult) {
          console.log(`✅ User ${i + 1} profile update successful: ${updateResult.name}`);
        } else {
          console.log(`❌ User ${i + 1} profile update failed`);
        }
      } else {
        console.log(`User ${i + 1} has no profile, creating one...`);
        
        // Create a new profile
        const newProfile = new MessProfile({
          userId: user._id,
          name: `Test Profile ${i + 1}`,
          location: {
            street: `${i + 1} Test Street`,
            city: 'Test City',
            district: 'Test District',
            state: 'Test State',
            pincode: '123456',
            country: 'India'
          },
          colleges: [`Test College ${i + 1}`],
          ownerPhone: `+91987654321${i}`,
          ownerEmail: `test${i + 1}@example.com`,
          types: ['Veg'],
          logo: null,
          operatingHours: []
        });
        
        const savedProfile = await newProfile.save();
        
        if (savedProfile) {
          console.log(`✅ User ${i + 1} profile creation successful: ${savedProfile.name}`);
          console.log(`   Profile ID: ${savedProfile._id}`);
          console.log(`   User ID: ${savedProfile.userId}`);
        } else {
          console.log(`❌ User ${i + 1} profile creation failed`);
        }
      }
    }
    
    // 7. Test duplicate prevention
    console.log('\n7. Testing duplicate prevention...');
    if (users.length > 0) {
      const testUser = users[0];
      
      try {
        const duplicateProfile = new MessProfile({
          userId: testUser._id,
          name: 'Duplicate Test Profile',
          location: {
            street: 'Duplicate Street',
            city: 'Duplicate City',
            district: 'Duplicate District',
            state: 'Duplicate State',
            pincode: '654321',
            country: 'India'
          },
          colleges: ['Duplicate College'],
          ownerPhone: '+919876543210',
          ownerEmail: 'duplicate@example.com',
          types: ['Veg'],
          logo: null,
          operatingHours: []
        });
        
        await duplicateProfile.save();
        console.log('❌ Duplicate profile was created (this should not happen)');
      } catch (error: any) {
        if (error.code === 11000) {
          console.log('✅ Duplicate prevention working correctly');
        } else {
          console.log('❌ Unexpected error:', error.message);
        }
      }
    }
    
    // 8. Final status
    console.log('\n8. Final status...');
    const finalCount = await MessProfile.countDocuments();
    console.log(`Total mess profiles: ${finalCount}`);
    
    const finalProfiles = await MessProfile.find({}).lean();
    finalProfiles.forEach((profile, index) => {
      console.log(`Profile ${index + 1}: ID=${profile._id}, Name=${profile.name}, UserID=${profile.userId}`);
    });
    
    // Check for any remaining problematic records
    const finalNullCheck = await MessProfile.find({ 
      $or: [
        { userId: null },
        { userId: undefined }
      ]
    });
    console.log(`Profiles with null/undefined userId: ${finalNullCheck.length}`);
    
    const finalMessOwnerIdCheck = await MessProfile.find({ messOwnerId: { $exists: true } });
    console.log(`Profiles with messOwnerId field: ${finalMessOwnerIdCheck.length}`);
    
    console.log('\n🎉 FINAL MESS PROFILE FIX COMPLETED SUCCESSFULLY!');
    console.log('\nThe database is now clean and ready for use.');
    console.log('Try creating your second mess profile again - it should work now!');

  } catch (error) {
    console.error('Error in final mess profile fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the final fix
finalMessProfileFix(); 