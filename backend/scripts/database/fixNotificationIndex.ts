import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixNotificationIndex = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;
    
    // Drop the old index that doesn't include status
    console.log('Dropping old notification index...');
    try {
      await db.collection('notifications').dropIndex('userId_1_messId_1_type_1_data.requestingUserId_1');
      console.log('✅ Old index dropped successfully');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  Old index was already dropped or never existed');
      } else {
        console.log('⚠️  Error dropping old index:', error.message);
      }
    }

    // Create the new index with status to allow rejoining
    console.log('Creating new notification index with status...');
    await db.collection('notifications').createIndex(
      { userId: 1, messId: 1, type: 1, 'data.requestingUserId': 1, status: 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ New index with status created successfully');

    // List all indexes to verify
    const indexes = await db.collection('notifications').indexes();
    console.log('\nCurrent notification indexes:');
    indexes.forEach((index: any) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n🎉 Notification index fixed successfully!');
    console.log('Users can now rejoin messes after leaving them.');

  } catch (error) {
    console.error('Error fixing notification index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
fixNotificationIndex();
