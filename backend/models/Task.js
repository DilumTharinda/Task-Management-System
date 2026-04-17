const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Task = sequelize.define('Task', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Who created this task
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' }
  },

  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium'
  },

  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Completed'),
    defaultValue: 'To Do'
  }

}, {
  timestamps: true
});

// Task belongs to a creator
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = Task;