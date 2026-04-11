const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

// This tells Sequelize to create a "Users" table with these columns
const User = sequelize.define('User', {

  // Auto-generated unique ID for each user
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Full name of the user
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Email must be unique - no two users can have the same email
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true // Sequelize checks if it looks like an email
    }
  },

  // We NEVER store the real password here - only the bcrypt hash
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Role controls what the user can do in the system
  // Only these three values are allowed
  role: {
    type: DataTypes.ENUM('Admin', 'ProjectManager', 'Collaborator'),
    allowNull: false
  },

  // If false, user cannot log in (soft delete - data stays in DB)
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  // Forces user to change password on first login
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

}, {
  timestamps: true // Automatically adds createdAt and updatedAt columns
});

module.exports = User;