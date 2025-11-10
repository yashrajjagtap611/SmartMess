import mongoose from 'mongoose';
import MessProfile from '../models/MessProfile';
import User from '../models/User';

const seedMessProfiles = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Create some sample users first (if they don't exist)
    const sampleUsers = await User.find({}).limit(3);
    
    if (sampleUsers.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    // Sample mess profiles
    const sampleMessProfiles = [
      {
        userId: sampleUsers[0]._id,
        name: 'Green Valley Mess',
        location: {
          street: '123 Main Street',
          city: 'Mumbai',
          district: 'Mumbai Suburban',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        colleges: ['Mumbai University', 'IIT Bombay'],
        ownerPhone: '+91-9876543210',
        ownerEmail: 'owner@greenvalleymess.com',
        types: ['Veg', 'Mixed'],
        logo: null,
        operatingHours: [
          { meal: 'breakfast', enabled: true, start: '07:00', end: '10:00' },
          { meal: 'lunch', enabled: true, start: '12:00', end: '15:00' },
          { meal: 'dinner', enabled: true, start: '19:00', end: '22:00' }
        ]
      },
      {
        userId: sampleUsers[1]?._id || sampleUsers[0]._id,
        name: 'Student Hub Mess',
        location: {
          street: '456 College Road',
          city: 'Mumbai',
          district: 'Mumbai Suburban',
          state: 'Maharashtra',
          pincode: '400002',
          country: 'India'
        },
        colleges: ['Mumbai University', 'NMIMS'],
        ownerPhone: '+91-9876543211',
        ownerEmail: 'owner@studenthubmess.com',
        types: ['Veg', 'Non-Veg'],
        logo: null,
        operatingHours: [
          { meal: 'breakfast', enabled: true, start: '07:30', end: '10:30' },
          { meal: 'lunch', enabled: true, start: '12:30', end: '15:30' },
          { meal: 'dinner', enabled: true, start: '19:30', end: '22:30' }
        ]
      },
      {
        userId: sampleUsers[2]?._id || sampleUsers[0]._id,
        name: 'Home Style Mess',
        location: {
          street: '789 University Lane',
          city: 'Mumbai',
          district: 'Mumbai Suburban',
          state: 'Maharashtra',
          pincode: '400003',
          country: 'India'
        },
        colleges: ['Mumbai University', 'SPIT'],
        ownerPhone: '+91-9876543212',
        ownerEmail: 'owner@homestylemess.com',
        types: ['Veg'],
        logo: null,
        operatingHours: [
          { meal: 'breakfast', enabled: true, start: '08:00', end: '11:00' },
          { meal: 'lunch', enabled: true, start: '13:00', end: '16:00' },
          { meal: 'dinner', enabled: true, start: '20:00', end: '23:00' }
        ]
      }
    ];

    // Clear existing mess profiles
    await MessProfile.deleteMany({});
    console.log('Cleared existing mess profiles');

    // Insert sample mess profiles
    const createdProfiles = await MessProfile.insertMany(sampleMessProfiles);
    console.log(`Created ${createdProfiles.length} sample mess profiles`);

    console.log('Sample data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeding function
seedMessProfiles(); 