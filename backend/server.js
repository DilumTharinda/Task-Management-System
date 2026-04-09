const sequelize = require('./config/db');

sequelize.authenticate()
  .then(() => console.log('Successfully connected to Azure MySQL!'))
  .catch(err => console.error('Connection error:', err));