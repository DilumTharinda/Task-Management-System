const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true, // Required for Azure security
    },
    // Add this to support emoji in all text fields
    charset: 'utf8mb4'
  },
   define: {
    // Apply utf8mb4 to all models by default
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

module.exports = sequelize;