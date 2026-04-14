// This script creates the first Admin user manually
// Run it with: node seedAdmin.js
// After running once, delete or keep it - never run twice

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db.js');
const User = require('./models/User.js');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Check if admin already exists to avoid duplicates
    const existing = await User.findOne({ where: { email: 'admin@tms.com' } });
    if (existing) {
      console.log('Admin already exists. Skipping.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@1234', 10);

    await User.create({
      name: 'System Admin',
      email: 'admin@tms.com',
      password: hashedPassword,
      role: 'Admin',
      isActive: true,
      mustChangePassword: false // Admin doesn't need to change on first login
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@tms.com');
    console.log('Password: Admin@1234');
    process.exit(0);

  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();