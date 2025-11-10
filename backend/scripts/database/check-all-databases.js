const mongoose = require('mongoose');

async function checkAllDatabases() {
  try {
    // Connect to MongoDB without specifying a database
    const mongoURI = 'mongodb://localhost:27017/';
    console.log('Connecting to:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    
    console.log('\n🗄️ Available databases:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    });

    // Check each database for users
    for (const dbInfo of databases.databases) {
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local') {
        console.log(`\n🔍 Checking database: ${dbInfo.name}`);
        
        try {
          // Connect to this specific database
          const dbConnection = mongoose.createConnection(`mongodb://localhost:27017/${dbInfo.name}`);
          
          // Create User model for this database
          const UserSchema = new mongoose.Schema({
            firstName: String,
            lastName: String,
            email: String,
            phone: String,
            password: String,
            role: String,
            isVerified: Boolean,
            messPhotoUrl: String
          });
          
          const User = dbConnection.model('User', UserSchema);
          
          // Check for users
          const userCount = await User.countDocuments();
          console.log(`  Users in ${dbInfo.name}: ${userCount}`);
          
          if (userCount > 0) {
            const users = await User.find({}).select('firstName lastName email').limit(5);
            console.log(`  Sample users:`);
            users.forEach((user, i) => {
              console.log(`    ${i + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
            });
            
            // Check for our specific user
            const testUser = await User.findOne({ email: 'nehadahake27@gmail.com' });
            if (testUser) {
              console.log(`  ✅ Found nehadahake27@gmail.com in ${dbInfo.name}!`);
            }
          }
          
          await dbConnection.close();
        } catch (error) {
          console.log(`  ❌ Error checking ${dbInfo.name}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkAllDatabases(); 