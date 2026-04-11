const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');
const User = require('./User.js');

// This creates the Tasks table in the database
const Task = sequelize.define('Task', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Task title is mandatory
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Optional longer description of the task
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Who this task is assigned to - links to Users table
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },

  // Who created this task - links to Users table
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },

  // When the task must be completed
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  // How important this task is
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium'
  },

  // Current progress of the task
  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Completed'),
    defaultValue: 'To Do'
  }

}, {
  timestamps: true
});

// A task belongs to a user (assigned to)
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });

// A task belongs to a user (created by)
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = Task;