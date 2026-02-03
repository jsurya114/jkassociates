/**
 * Seed Admin User
 * Run this script once to create the admin user in the database
 * 
 * Usage: node seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    try {
        // Connect to database
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'nishanth2026' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists. Updating password...');
            existingAdmin.password = 'nishanth@2026';
            await existingAdmin.save();
            console.log('✅ Admin password updated successfully!');
        } else {
            // Create new admin
            const admin = new Admin({
                username: 'nishanth2026',
                password: 'nishanth@2026'
            });

            await admin.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('\n📋 Admin Credentials:');
        console.log('   Username: nishanth2026');
        console.log('   Password: nishanth@2026');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
