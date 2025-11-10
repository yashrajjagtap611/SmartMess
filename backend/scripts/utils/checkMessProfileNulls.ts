import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MessProfile from '../models/MessProfile';

dotenv.config();

const checkMessProfileNulls = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== Checking for Null Values in MessProfile ===');
    
    // Check for any field that might be null
    const allProfiles = await MessProfile.find({}).lean();
    console.log(`Total profiles: ${allProfiles.length}`);
    
    allProfiles.forEach((profile, index) => {
      console.log(`\nProfile ${index + 1}:`);
      console.log(`  _id: ${profile._id}`);
      console.log(`  userId: ${profile.userId} (type: ${typeof profile.userId})`);
      console.log(`  name: ${profile.name}`);
      console.log(`  ownerEmail: ${profile.ownerEmail}`);
      
      // Check if userId is null, undefined, or empty
      if (profile.userId === null) {
        console.log(`  ❌ userId is NULL`);
      } else if (profile.userId === undefined) {
        console.log(`  ❌ userId is UNDEFINED`);
      } else if (!profile.userId) {
        console.log(`  ❌ userId is empty/falsy: ${profile.userId}`);
      } else {
        console.log(`  ✅ userId is valid: ${profile.userId}`);
      }
    });

    // Check for any profiles with null userId specifically
    const nullUserIdProfiles = await MessProfile.find({ userId: null });
    console.log(`\nProfiles with null userId: ${nullUserIdProfiles.length}`);
    
    const undefinedUserIdProfiles = await MessProfile.find({ userId: undefined });
    console.log(`Profiles with undefined userId: ${undefinedUserIdProfiles.length}`);
    
    const missingUserIdProfiles = await MessProfile.find({ userId: { $exists: false } });
    console.log(`Profiles with missing userId field: ${missingUserIdProfiles.length}`);

    // Check for any profiles with empty string userId
    const emptyUserIdProfiles = await MessProfile.find({ userId: "" });
    console.log(`Profiles with empty string userId: ${emptyUserIdProfiles.length}`);

    // Check for any profiles with messOwnerId field (shouldn't exist)
    const messOwnerIdProfiles = await MessProfile.find({ messOwnerId: { $exists: true } });
    console.log(`Profiles with messOwnerId field: ${messOwnerIdProfiles.length}`);

    if (messOwnerIdProfiles.length > 0) {
      console.log('\nFound profiles with messOwnerId field:');
      messOwnerIdProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile._id}, messOwnerId: ${(profile as any).messOwnerId}`);
      });
    }

    // Check all indexes again
    console.log('\n=== Current Indexes ===');
    const indexes = await MessProfile.collection.getIndexes();
    console.log('Indexes:', JSON.stringify(indexes, null, 2));

    // Check if there are any documents that would violate the unique constraint
    console.log('\n=== Checking for Duplicate userId Values ===');
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
    } else {
      console.log('✅ No duplicate userId values found');
    }

    console.log('\n=== Summary ===');
    console.log(`Total profiles: ${allProfiles.length}`);
    console.log(`Profiles with null userId: ${nullUserIdProfiles.length}`);
    console.log(`Profiles with undefined userId: ${undefinedUserIdProfiles.length}`);
    console.log(`Profiles with missing userId field: ${missingUserIdProfiles.length}`);
    console.log(`Profiles with empty string userId: ${emptyUserIdProfiles.length}`);
    console.log(`Profiles with messOwnerId field: ${messOwnerIdProfiles.length}`);
    console.log(`Duplicate userId groups: ${duplicateCheck.length}`);

  } catch (error) {
    console.error('Error checking mess profile nulls:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the check
checkMessProfileNulls(); 