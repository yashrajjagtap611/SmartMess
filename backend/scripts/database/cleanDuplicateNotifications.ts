import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../../src/models/Notification';
import MessMembership from '../../src/models/MessMembership';

dotenv.config();

const cleanDuplicateNotifications = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all notifications
    const allNotifications = await Notification.find({});
    console.log(`Total notifications: ${allNotifications.length}`);

    // Group notifications by userId, type, title, and message to find duplicates
    const duplicates = new Map();
    const toDelete: string[] = [];

    // Find duplicate notifications
    allNotifications.forEach(notification => {
      const key = `${notification.userId}_${notification.type}_${notification.title}_${notification.message}`;
      
      if (duplicates.has(key)) {
        // This is a duplicate, mark for deletion
        toDelete.push(notification._id.toString());
        console.log(`Duplicate found: ${notification.title} for user ${notification.userId}`);
      } else {
        duplicates.set(key, notification._id);
      }
    });

    // Find duplicate join requests specifically
    const joinRequests = await Notification.find({ type: 'join_request', status: 'pending' });
    const joinRequestDuplicates = new Map();
    
    joinRequests.forEach(notification => {
      const key = `${notification.userId}_${notification.messId}_${notification.type}_${notification.data?.requestingUserId}`;
      
      if (joinRequestDuplicates.has(key)) {
        // This is a duplicate join request, mark for deletion
        toDelete.push(notification._id.toString());
        console.log(`Duplicate join request found: ${notification.title} for user ${notification.userId} in mess ${notification.messId}`);
      } else {
        joinRequestDuplicates.set(key, notification._id);
      }
    });

    // Remove duplicates from toDelete array
    const uniqueToDelete = [...new Set(toDelete)];
    
    console.log(`\nFound ${uniqueToDelete.length} duplicate notifications to delete`);

    if (uniqueToDelete.length > 0) {
      // Delete duplicates
      const result = await Notification.deleteMany({ _id: { $in: uniqueToDelete } });
      console.log(`✅ Deleted ${result.deletedCount} duplicate notifications`);
    }

    // Check for orphaned memberships (memberships without corresponding notifications)
    const memberships = await MessMembership.find({ status: 'active' });
    console.log(`\nChecking ${memberships.length} active memberships for orphaned records...`);
    
    let orphanedCount = 0;
    for (const membership of memberships) {
      const notification = await Notification.findOne({
        type: 'join_request',
        status: 'approved',
        'data.requestingUserId': membership.userId.toString(),
        messId: membership.messId
      });
      
      if (!notification) {
        console.log(`Orphaned membership found: User ${membership.userId} in Mess ${membership.messId}`);
        orphanedCount++;
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`\nFound ${orphanedCount} orphaned memberships. These may need manual review.`);
    }

    // Show final count
    const finalCount = await Notification.countDocuments();
    console.log(`\nFinal notification count: ${finalCount}`);

  } catch (error) {
    console.error('Error cleaning notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
cleanDuplicateNotifications(); 