import mongoose from 'mongoose';
import User from '../../src/models/User';
import MessMembership from '../../src/models/MessMembership';
import MessProfile from '../../src/models/MessProfile';

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env['MONGODB_URI'] || 'mongodb+srv://yashrajuser:yash%402702@test-pro-db.dbwohui.mongodb.net/MassHub?retryWrites=true&w=majority&appName=test-pro-db';
    console.log('Connecting to:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check Users
    const userCount = await User.countDocuments();
    console.log(`\n👥 Users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}).select('firstName lastName email role isVerified createdAt');
      console.log('\n📋 Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - Verified: ${user.isVerified} - Created: ${user.createdAt}`);
      });
    }

    // Check Mess Profiles
    const messCount = await MessProfile.countDocuments();
    console.log(`\n🏠 Mess Profiles in database: ${messCount}`);
    
    if (messCount > 0) {
      const messProfiles = await MessProfile.find({}).select('name userId createdAt');
      console.log('\n📋 Mess Profiles:');
      messProfiles.forEach((mess, index) => {
        console.log(`${index + 1}. ${mess.name} (ID: ${mess._id}) - Owner: ${mess.userId} - Created: ${mess.createdAt}`);
      });
    }

    // Check Mess Memberships
    const membershipCount = await MessMembership.countDocuments();
    console.log(`\n🔗 Mess Memberships in database: ${membershipCount}`);
    
    if (membershipCount > 0) {
      const memberships = await MessMembership.find({})
        .populate('userId', 'firstName lastName email')
        .populate('messId', 'name')
        .select('userId messId status paymentStatus subscriptionStartDate subscriptionEndDate createdAt');
      
      console.log('\n📋 Memberships:');
      memberships.forEach((membership, index) => {
        const user = membership.userId as any;
        const mess = membership.messId as any;
        console.log(`${index + 1}. ${user?.firstName} ${user?.lastName} (${user?.email}) -> ${mess?.name} - Status: ${membership.status} - Payment: ${membership.paymentStatus} - Created: ${membership.createdAt}`);
      });
    }

    // Check database collections
    console.log('\n🗄️ Database Collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check specific user
    const testUser = await User.findOne({ email: 'nehadahake27@gmail.com' });
    if (testUser) {
      console.log('\n✅ Test user found:');
      console.log(`- Name: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`- Email: ${testUser.email}`);
      console.log(`- Role: ${testUser.role}`);
      console.log(`- Verified: ${testUser.isVerified}`);
      console.log(`- Created: ${testUser.createdAt}`);
    } else {
      console.log('\n❌ Test user not found');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

checkDatabase(); 