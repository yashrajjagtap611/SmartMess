import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import MessMembership from '../models/MessMembership';
import MessProfile from '../models/MessProfile';

dotenv.config();

const fixUserMembership = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get the user with membership
    const userWithMembership = await User.findById('68885d5f761c8a75fb72d8a1');
    const mess = await MessProfile.findOne({});
    
    if (!userWithMembership || !mess) {
      console.log('Required data not found');
      return;
    }

    console.log('User with membership:', userWithMembership.firstName, userWithMembership.lastName);
    console.log('Mess:', mess.name);

    // Create membership for all users who don't have one
    const allUsers = await User.find({});
    
    for (const user of allUsers) {
      const existingMembership = await MessMembership.findOne({ userId: user._id });
      
      if (!existingMembership) {
        console.log(`Creating membership for ${user.firstName} ${user.lastName}...`);
        
        // Calculate subscription end date (30 days from start)
        const subscriptionStartDate = new Date();
        const subscriptionEndDate = new Date(subscriptionStartDate);
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        
        const membership = new MessMembership({
          userId: user._id,
          messId: mess._id,
          status: 'active',
          paymentStatus: 'paid',
          lastPaymentDate: new Date(),
          subscriptionStartDate: subscriptionStartDate,
          subscriptionEndDate: subscriptionEndDate
        });
        
        await membership.save();
        console.log(`✅ Membership created for ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`✅ ${user.firstName} ${user.lastName} already has membership`);
      }
    }

    console.log('\n=== Final Status ===');
    const finalMemberships = await MessMembership.find({}).populate('userId', 'firstName lastName');
    finalMemberships.forEach(membership => {
      console.log(`- ${(membership.userId as any).firstName} ${(membership.userId as any).lastName}: ${membership.status}`);
    });

  } catch (error) {
    console.error('Error in fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix
fixUserMembership(); 