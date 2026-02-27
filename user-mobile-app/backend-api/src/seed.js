// Database seeder - Add initial admin user
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import db from './models/index.js';

const seedAdmin = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if admin already exists
    const existingAdmin = await db.User.findOne({
      where: { email: 'admin@artandcraft.com' }
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    const admin = await db.User.create({
      name: 'Admin User',
      email: 'admin@artandcraft.com',
      password: hashedPassword,
      userType: 'admin',
      phone: '+1234567890',
      isActive: true,
      isVerified: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@artandcraft.com');
    console.log('🔑 Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
