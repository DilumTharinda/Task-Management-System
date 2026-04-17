const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');
const User = require('./User.js');

const Notification = sequelize.define('Notification', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Who receives this notification
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' }
  },

  // Short title of the notification
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Full notification message
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // Type helps frontend show different icons
  // task_assigned, status_changed, comment_added, deadline_approaching
  type: {
    type: DataTypes.ENUM(
      'task_assigned',
      'task_updated',
      'status_changed',
      'comment_added',
      'deadline_approaching',
      'general'
    ),
    defaultValue: 'general'
  },

  // Link to the related task if any
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },

  // Whether user has seen this notification
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }

}, {
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

Notification.belongsTo(User, { as: 'recipient', foreignKey: 'userId' });

module.exports = Notification;