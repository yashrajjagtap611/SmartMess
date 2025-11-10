import mongoose from 'mongoose';
import User from '../models/User';

const users = [
  {
    "firstName": "ROHIT",
    "lastName": "DAHAKE",
    "email": "rohitdahake49@yahoo.com",
    "phone": "83739779466",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "RAHUL",
    "lastName": "DESHMUKH",
    "email": "rahuldeshmukh51@outlook.com",
    "phone": "83918709448",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "ROHIT",
    "lastName": "SURYAVANSHI",
    "email": "rohitsuryavanshi27@example.com",
    "phone": "94481313810",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "ANITA",
    "lastName": "JADHAV",
    "email": "anitajadhav16@gmail.com",
    "phone": "82868526174",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "KOMAL",
    "lastName": "BHISE",
    "email": "komalbhise56@mail.com",
    "phone": "81905851891",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "PRIYA",
    "lastName": "JADHAV",
    "email": "priyajadhav11@yahoo.com",
    "phone": "70770470162",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "SURESH",
    "lastName": "DESHMUKH",
    "email": "sureshdeshmukh20@yahoo.com",
    "phone": "82067315173",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "KIRAN",
    "lastName": "JAGTAP",
    "email": "kiranjagtap53@gmail.com",
    "phone": "94637533963",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "ROHIT",
    "lastName": "GORE",
    "email": "rohitgore8@yahoo.com",
    "phone": "96186261124",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "NEHA",
    "lastName": "BHISE",
    "email": "nehabhise37@mail.com",
    "phone": "94729308439",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "YASHRAJ",
    "lastName": "GAWANDE",
    "email": "yashrajgawande78@example.com",
    "phone": "85593931060",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "PRIYA",
    "lastName": "BARVE",
    "email": "priyabarve11@yahoo.com",
    "phone": "96124686619",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "SUNIL",
    "lastName": "NIMBALKAR",
    "email": "sunilnimbalkar42@example.com",
    "phone": "80250884967",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "NEHA",
    "lastName": "DAHAKE",
    "email": "nehadahake27@gmail.com",
    "phone": "73190112232",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "NEHA",
    "lastName": "PHADKE",
    "email": "nehaphadke65@gmail.com",
    "phone": "86532830397",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "PRIYA",
    "lastName": "JAGTAP",
    "email": "priyajagtap76@example.com",
    "phone": "74587317674",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "AMIT",
    "lastName": "BARVE",
    "email": "amitbarve58@yahoo.com",
    "phone": "76799921372",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "ANITA",
    "lastName": "BHISE",
    "email": "anitabhise60@example.com",
    "phone": "86522934977",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "DEEPAK",
    "lastName": "BHOSALE",
    "email": "deepakbhosale66@gmail.com",
    "phone": "97380313565",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  },
  {
    "firstName": "PRIYA",
    "lastName": "BHOSALE",
    "email": "priyabhosale53@example.com",
    "phone": "77388694699",
    "password": "$2a$10$hwkkLPQ0d1n71aaD.yIugOFzluQg9ClRLanhqwHcvudtWMPlAnsVW",
    "role": "user",
    "isVerified": true,
    "messPhotoUrl": null
  }
];

const insertUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SmartMess';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check for existing users with the same emails
    const existingEmails = await User.find({ 
      email: { $in: users.map(user => user.email) } 
    }).select('email');
    
    const existingEmailList = existingEmails.map(user => user.email);
    const newUsers = users.filter(user => !existingEmailList.includes(user.email));

    if (newUsers.length === 0) {
      console.log('All users already exist in the database.');
      return;
    }

    if (existingEmailList.length > 0) {
      console.log(`Skipping ${existingEmailList.length} existing users:`, existingEmailList);
    }

    // Insert new users
    const createdUsers = await User.insertMany(newUsers);
    console.log(`Successfully inserted ${createdUsers.length} new users:`);
    
    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
    });

    console.log('User insertion completed successfully!');
  } catch (error) {
    console.error('Error inserting users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the insertion function
insertUsers(); 