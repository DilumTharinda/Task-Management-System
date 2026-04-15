const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');
const User = require('./User.js');
const Task = require('./Task.js');

const Attachment = sequelize.define('Attachment', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Original file name when user uploaded it
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // The file name we saved it as on the server
  // We rename files to avoid conflicts
  storedFileName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // The full path where file is saved on server
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // File type like image/jpeg, application/pdf
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // File size in bytes
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Which task this attachment belongs to
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: 'id'
    }
  },

  // Who uploaded this file
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }

}, {
  timestamps: true
});

// An attachment belongs to a task
Attachment.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// An attachment belongs to a user
Attachment.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });

module.exports = Attachment;