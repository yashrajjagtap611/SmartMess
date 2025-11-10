import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MessProfile from '../models/MessProfile';

dotenv.config();

const fixMessProfileIndex = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== Checking MessProfile Collection ===');
    
    // Check all mess profiles
    const allProfiles = await MessProfile.find({});
    console.log(`Total mess profiles: ${allProfiles.length}`);
    
    // Check for profiles with null or undefined userId
    const nullUserIdProfiles = await MessProfile.find({ userId: { $in: [null, undefined] } });
    console.log(`Profiles with null/undefined userId: ${nullUserIdProfiles.length}`);
    
    if (nullUserIdProfiles.length > 0) {
      console.log('\n=== Found profiles with null userId ===');
      nullUserIdProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile._id}, Name: ${profile.name}, userId: ${profile.userId}`);
      });
      
      // Delete profiles with null userId
      console.log('\n=== Deleting profiles with null userId ===');
      const deleteResult = await MessProfile.deleteMany({ userId: { $in: [null, undefined] } });
      console.log(`Deleted ${deleteResult.deletedCount} profiles with null userId`);
    }

    // Check for duplicate userId entries
    console.log('\n=== Checking for duplicate userId entries ===');
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
        console.log(`${index + 1}. userId: ${group._id}, count: ${group.count}`);
        console.log(`   Profile IDs: ${group.profiles.join(', ')}`);
      });
      
      // Keep only the first profile for each duplicate userId
      console.log('\n=== Keeping only the first profile for each duplicate userId ===');
      for (const group of duplicateCheck) {
        const profilesToDelete = group.profiles.slice(1); // Keep first, delete rest
        const deleteResult = await MessProfile.deleteMany({ _id: { $in: profilesToDelete } });
        console.log(`Deleted ${deleteResult.deletedCount} duplicate profiles for userId: ${group._id}`);
      }
    }

    // Drop and recreate indexes to ensure they're correct
    console.log('\n=== Recreating indexes ===');
    try {
      await MessProfile.collection.dropIndexes();
      console.log('Dropped existing indexes');
    } catch (error) {
      console.log('No existing indexes to drop');
    }

    // Create proper indexes
    await MessProfile.collection.createIndex({ userId: 1 }, { unique: true });
    await MessProfile.collection.createIndex({ 'location.city': 1 });
    await MessProfile.collection.createIndex({ 'location.state': 1 });
    console.log('Created new indexes');

    // Final check
    console.log('\n=== Final Status ===');
    const finalCount = await MessProfile.countDocuments();
    console.log(`Total mess profiles after cleanup: ${finalCount}`);
    
    const finalNullCheck = await MessProfile.find({ userId: { $in: [null, undefined] } });
    console.log(`Profiles with null userId after cleanup: ${finalNullCheck.length}`);

    console.log('\n✅ MessProfile index fix completed successfully!');

  } catch (error) {
    console.error('Error fixing mess profile index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix
fixMessProfileIndex(); 