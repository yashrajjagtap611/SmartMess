/*
  Seed users from a JSON file.
  Usage:
    node backend/scripts/seed-users-from-json.js --file backend/scripts/data/users.sample.json

  Requirements:
    - Set environment variable MONGODB_URI to your MongoDB connection string.
*/

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables from .env (try backend/.env first, then project root .env)
(() => {
  const backendEnv = path.resolve(__dirname, '..', '.env');
  const rootEnv = path.resolve(__dirname, '..', '..', '.env');
  if (fs.existsSync(backendEnv)) {
    dotenv.config({ path: backendEnv });
  } else if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  } else {
    dotenv.config();
  }
})();

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--file' || arg === '-f') {
      result.file = args[i + 1];
      i++;
    }
  }
  return result;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not defined. Ensure it is set in your .env file (e.g., backend/.env) or in the shell environment.`);
  }
  return value;
}

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'mess-owner', 'admin'], required: true },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    joinDate: { type: Date, default: Date.now },
    address: { type: String, default: '' },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: { type: String, enum: ['public', 'private', 'mess-only'], default: 'mess-only' },
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
      },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      language: { type: String, default: 'en' },
      dietary: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
      mealTimes: {
        breakfast: { type: String, default: '08:00' },
        lunch: { type: String, default: '13:00' },
        dinner: { type: String, default: '19:00' },
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function connect() {
  const mongoUri = requireEnv('MONGODB_URI');
  await mongoose.connect(mongoUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  });
}

function readUsers(jsonPath) {
  const absolute = path.isAbsolute(jsonPath) ? jsonPath : path.join(process.cwd(), jsonPath);
  const raw = fs.readFileSync(absolute, 'utf-8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of users');
  }
  return data;
}

function normalizeUser(u) {
  return {
    firstName: String(u.firstName || '').trim(),
    lastName: String(u.lastName || '').trim(),
    email: String(u.email || '').trim().toLowerCase(),
    phone: String(u.phone || '').trim(),
    password: String(u.password || '').trim(),
    role: u.role === 'admin' || u.role === 'mess-owner' ? u.role : 'user',
    address: String(u.address || ''),
    isVerified: Boolean(u.isVerified ?? true),
    status: 'active',
    joinDate: u.joinDate ? new Date(u.joinDate) : new Date(),
  };
}

function validateUser(u) {
  const errors = [];
  if (!u.firstName) errors.push('firstName');
  if (!u.lastName) errors.push('lastName');
  if (!u.email || !u.email.includes('@')) errors.push('email');
  if (!u.phone) errors.push('phone');
  if (!u.password || u.password.length < 8) errors.push('password');
  if (!u.role) errors.push('role');
  return errors;
}

async function seed(users) {
  let created = 0;
  let skipped = 0;
  for (const rawUser of users) {
    const u = normalizeUser(rawUser);
    const errs = validateUser(u);
    if (errs.length) {
      console.warn(`Skipping user ${u.email || '(no email)'} - invalid fields: ${errs.join(', ')}`);
      skipped++;
      continue;
    }

    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Skipping existing user: ${u.email}`);
      skipped++;
      continue;
    }

    const hashed = await bcrypt.hash(u.password, 12);
    const doc = new User({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      password: hashed,
      role: u.role,
      isVerified: u.isVerified,
      status: u.status,
      joinDate: u.joinDate,
      address: u.address,
    });

    await doc.save();
    created++;
    console.log(`Created user: ${u.email}`);
  }
  return { created, skipped };
}

async function main() {
  try {
    const { file } = parseArgs();
    const jsonPath = file || 'backend/scripts/data/users.sample.json';
    const users = readUsers(jsonPath);

    // Optional: basic split check (Dehu Phata vs other Pune) to align with requirement
    const dehuCount = users.filter(u => String(u.address || '').toLowerCase().includes('dehu phata')).length;
    if (dehuCount === 0) {
      console.warn('Warning: No users found with address containing "Dehu Phata"');
    }

    await connect();
    const result = await seed(users);
    console.log(`\nSummary: created=${result.created}, skipped=${result.skipped}`);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
    } catch (_) {}
  }
}

main();


