const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');
const Task = require('./Task.js');
const User = require('./User.js');

// This table stores the many-to-many relationship
// between Tasks and Users
// One task can have many assignees
// One user can be assigned to many tasks
const TaskAssignee = sequelize.define('TaskAssignee', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Task, key: 'id' }
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' }
  }

}, {
  timestamps: true
});

// Set up associations
Task.belongsToMany(User, {
  through: TaskAssignee,
  as: 'assignees',
  foreignKey: 'taskId'
});

User.belongsToMany(Task, {
  through: TaskAssignee,
  as: 'assignedTasks',
  foreignKey: 'userId'
});

module.exports = TaskAssignee;