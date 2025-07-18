const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shift = require('../models/Shift');

/**
 * Initialize database with default data
 */
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123', salt);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      });
      
      console.log('Default admin user created');
    }
    
    // Create default shifts if they don't exist
    const shiftsCount = await Shift.countDocuments();
    
    if (shiftsCount === 0) {
      console.log('Creating default shifts...');
      const defaultShifts = Shift.getPredefinedShifts();
      
      await Shift.insertMany(defaultShifts);
      console.log('Default shifts created');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };