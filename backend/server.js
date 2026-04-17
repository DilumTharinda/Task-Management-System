const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const taskRoutes = require('./routes/taskRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js');
const attachmentRoutes = require('./routes/attachmentRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');

const app = express();

// Create HTTP server from Express app
// This is needed so socket.io can share the same port
const server = http.createServer(app);

// Create socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in all controllers via req.app.get('io')
app.set('io', io);

app.use(cors());
app.use(express.json());

// Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger documentation at /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/notifications', notificationRoutes);

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
    require('./models/TaskAssignee');
    require('./models/Comment');
    require('./models/Attachment');
    require('./models/Notification');
    return sequelize.sync({ force: false });
  })
  .then(() => {
    // Start WebSocket
    const { initializeSocket } = require('./utils/socketManager');
    initializeSocket(io);
    console.log('WebSocket server initialized');

    // Start deadline scheduler
    const { startScheduler } = require('./utils/taskScheduler');
    startScheduler();

    // Use server.listen instead of app.listen
    // so socket.io shares the same port
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
  });