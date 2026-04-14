const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Allow frontend to talk to this backend
app.use(cors());

// Allow server to read JSON from request bodies
app.use(express.json());

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TMS Backend is running!' });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Connected to Azure MySQL!');
    require('./models/User');
    require('./models/Task');
    // force: false means never drop tables
    // alter: false means stop adding duplicate indexes
    return sequelize.sync({ force: false });
  })
  .then(() => {
    const { startScheduler } = require('./utils/taskScheduler');
    startScheduler();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
  });