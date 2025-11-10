const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://yashrajuser:yash%402702@test-pro-db.dbwohui.mongodb.net/Smartmess?retryWrites=true&w=majority&appName=test-pro-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (matching the actual User model)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'mess-owner', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  joinDate: { type: Date, default: Date.now },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'mess-only'], default: 'mess-only' },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' },
    dietary: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    mealTimes: {
      breakfast: { type: String, default: '08:00' },
      lunch: { type: String, default: '13:00' },
      dinner: { type: String, default: '19:00' }
    }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'yashrajjagtap57@gmail.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: yashrajjagtap57@gmail.com');
      console.log('Password: Yash@2702');
      console.log('Role: admin');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Yash@2702', 12);

    // Create admin user with all required fields
    const adminUser = new User({
      firstName: 'Yash',
      lastName: 'Jagtap',
      email: 'yashrajjagtap57@gmail.com',
      phone: '+1234567890', // Required field
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      status: 'active',
      joinDate: new Date(),
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profileVisibility: 'mess-only',
          showEmail: false,
          showPhone: false
        },
        theme: 'auto',
        language: 'en',
        dietary: [],
        allergies: [],
        mealTimes: {
          breakfast: '08:00',
          lunch: '13:00',
          dinner: '19:00'
        }
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('Email: yashrajjagtap57@gmail.com');
    console.log('Password: Yash@2702');
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser(); 