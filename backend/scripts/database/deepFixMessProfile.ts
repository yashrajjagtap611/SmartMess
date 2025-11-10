import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MessProfile from '../models/MessProfile';
import User from '../models/User';

dotenv.config();

const deepFixMessProfile = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== Deep Investigation of MessProfile Collection ===');
    
    // 1. Check all indexes on the collection
    console.log('\n1. Checking all indexes...');
    const indexes = await MessProfile.collection.getIndexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));
    
    // 2. Check all documents in detail
    console.log('\n2. Checking all documents...');
    const allProfiles = await MessProfile.find({}).lean();
    console.log(`Total profiles: ${allProfiles.length}`);
    
    allProfiles.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`);
      console.log(`  ID: ${profile._id}`);
      console.log(`  Name: ${profile.name}`);
      console.log(`  userId: ${profile.userId}`);
      console.log(`  userId type: ${typeof profile.userId}`);
      console.log(`  userId is null: ${profile.userId === null}`);
      console.log(`  userId is undefined: ${profile.userId === undefined}`);
      console.log('  ---');
    });

    // 3. Check for any field named messOwnerId
    console.log('\n3. Checking for messOwnerId field...');
    const profilesWithMessOwnerId = await MessProfile.find({ messOwnerId: { $exists: true } });
    console.log(`Profiles with messOwnerId field: ${profilesWithMessOwnerId.length}`);
    
    if (profilesWithMessOwnerId.length > 0) {
      console.log('Found profiles with messOwnerId field:');
      profilesWithMessOwnerId.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile._id}, messOwnerId: ${(profile as any).messOwnerId}`);
      });
    }

    // 4. Check for profiles with null/undefined userId
    console.log('\n4. Checking for null/undefined userId...');
    const nullUserIdProfiles = await MessProfile.find({ 
      $or: [
        { userId: null },
        { userId: undefined },
        { userId: { $exists: false } }
      ]
    });
    console.log(`Profiles with null/undefined/missing userId: ${nullUserIdProfiles.length}`);
    
    if (nullUserIdProfiles.length > 0) {
      console.log('Found profiles with null/undefined userId:');
      nullUserIdProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile._id}, Name: ${profile.name}`);
      });
      
      // Delete these problematic profiles
      console.log('\nDeleting profiles with null/undefined userId...');
      const deleteResult = await MessProfile.deleteMany({
        $or: [
          { userId: null },
          { userId: undefined },
          { userId: { $exists: false } }
        ]
      });
      console.log(`Deleted ${deleteResult.deletedCount} profiles with null/undefined userId`);
    }

    // 5. Check for duplicate userId entries
    console.log('\n5. Checking for duplicate userId entries...');
    const duplicateCheck = await MessProfile.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          profiles: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicateCheck.length > 0) {
      console.log(`Found ${duplicateCheck.length} userIds with duplicate profiles:`);
      duplicateCheck.forEach((group, index) => {
        console.log(`  ${index + 1}. userId: ${group._id}, count: ${group.count}`);
        console.log(`     Profile IDs: ${group.profiles.join(', ')}`);
      });
      
      // Keep only the first profile for each duplicate userId
      console.log('\nKeeping only the first profile for each duplicate userId...');
      for (const group of duplicateCheck) {
        const profilesToDelete = group.profiles.slice(1); // Keep first, delete rest
        const deleteResult = await MessProfile.deleteMany({ _id: { $in: profilesToDelete } });
        console.log(`Deleted ${deleteResult.deletedCount} duplicate profiles for userId: ${group._id}`);
      }
    }

    // 6. Drop ALL indexes and recreate them properly
    console.log('\n6. Dropping all indexes and recreating...');
    try {
      await MessProfile.collection.dropIndexes();
      console.log('✅ Dropped all existing indexes');
    } catch (error) {
      console.log('No existing indexes to drop or error dropping indexes:', error);
    }

    // 7. Create proper indexes
    console.log('\n7. Creating proper indexes...');
    try {
      await MessProfile.collection.createIndex({ userId: 1 }, { unique: true });
      console.log('✅ Created unique index on userId');
      
      await MessProfile.collection.createIndex({ 'location.city': 1 });
      console.log('✅ Created index on location.city');
      
      await MessProfile.collection.createIndex({ 'location.state': 1 });
      console.log('✅ Created index on location.state');
    } catch (error) {
      console.log('Error creating indexes:', error);
    }

    // 8. Verify the new indexes
    console.log('\n8. Verifying new indexes...');
    const newIndexes = await MessProfile.collection.getIndexes();
    console.log('New indexes:', JSON.stringify(newIndexes, null, 2));

    // 9. Test creating a profile
    console.log('\n9. Testing profile creation...');
    const testUser = await User.findOne({});
    if (testUser) {
      console.log('Test User:', testUser.firstName, testUser.lastName);
      
      // Check if profile already exists for this user
      const existingProfile = await MessProfile.findOne({ userId: testUser._id });
      if (existingProfile) {
        console.log('Profile already exists for test user, testing update...');
        const updateResult = await MessProfile.findOneAndUpdate(
          { userId: testUser._id },
          { name: 'Test Updated Profile' },
          { new: true, runValidators: true }
        );
        if (updateResult) {
          console.log('✅ Profile update test successful');
        }
      } else {
        console.log('No existing profile, testing creation...');
        const testProfile = new MessProfile({
          userId: testUser._id,
          name: 'Test Profile',
          location: {
            street: 'Test Street',
            city: 'Test City',
            district: 'Test District',
            state: 'Test State',
            pincode: '123456',
            country: 'India'
          },
          colleges: ['Test College'],
          ownerPhone: '+919876543210',
          ownerEmail: 'test@example.com',
          types: ['Veg']
        });
        
        const savedProfile = await testProfile.save();
        if (savedProfile) {
          console.log('✅ Profile creation test successful');
          // Clean up test profile
          await MessProfile.findByIdAndDelete(savedProfile._id);
          console.log('✅ Test profile cleaned up');
        }
      }
    }

    // 10. Final status
    console.log('\n10. Final Status...');
    const finalCount = await MessProfile.countDocuments();
    console.log(`Total mess profiles: ${finalCount}`);
    
    const finalNullCheck = await MessProfile.find({ 
      $or: [
        { userId: null },
        { userId: undefined },
        { userId: { $exists: false } }
      ]
    });
    console.log(`Profiles with null/undefined userId: ${finalNullCheck.length}`);

    console.log('\n🎉 Deep fix completed successfully!');

  } catch (error) {
    console.error('Error in deep fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the deep fix
deepFixMessProfile(); 