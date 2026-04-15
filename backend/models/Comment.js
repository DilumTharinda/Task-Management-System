const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');
const User = require('./User.js');
const Task = require('./Task.js');

const Comment = sequelize.define('Comment', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Comment text — supports emoji because database uses utf8mb4
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // Which task this comment belongs to
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: 'id'
    }
  },

  // Who wrote this comment
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },

  // Optional file attached directly to this comment
  // This is separate from task attachments
  // A comment can have one file attached to it or none
  attachmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },

  // Store the attached file details directly on the comment
  // So we do not need a separate query to get comment file info
  commentFileName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },

  commentStoredFileName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },

  commentFilePath: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },

  commentFileType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },

  commentFileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },

  // Track if comment was edited
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }

}, {
  timestamps: true,
  // Apply utf8mb4 at model level as well
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

Comment.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });
Comment.belongsTo(User, { as: 'author', foreignKey: 'userId' });

module.exports = Comment;