const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification.js');
const User = require('../models/User.js');

// Store online users - key is userId, value is socket id
// This lets us find the socket of any online user instantly
const onlineUsers = new Map();

const initializeSocket = (io) => {

  // Middleware to verify JWT when socket connects
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.userId;
    console.log(`User ${userId} connected via WebSocket`);

    // Register this user as online
    onlineUsers.set(userId, socket.id);

    // When user connects deliver any unread notifications
    // that were stored while they were offline
    try {
      const unreadNotifications = await Notification.findAll({
        where: { userId, isRead: false },
        order: [['createdAt', 'DESC']],
        limit: 20
      });

      if (unreadNotifications.length > 0) {
        socket.emit('unread_notifications', unreadNotifications);
      }
    } catch (error) {
      console.error('Error delivering offline notifications:', error);
    }

    // Mark notifications as read when user confirms receipt
    socket.on('mark_read', async (notificationId) => {
      try {
        await Notification.update(
          { isRead: true },
          { where: { id: notificationId, userId } }
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // Mark all notifications as read
    socket.on('mark_all_read', async () => {
      try {
        await Notification.update(
          { isRead: true },
          { where: { userId, isRead: false } }
        );
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    });

    // When user disconnects remove them from online users
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });
};

// Send notification to a specific user
// If user is online deliver instantly via socket
// If user is offline save to database for later delivery
const sendNotification = async (io, userId, notificationData) => {
  try {
    // Always save notification to database first
    const notification = await Notification.create({
      userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'general',
      taskId: notificationData.taskId || null,
      isRead: false
    });

    // If user is currently online send it immediately
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Send notification to multiple users at once
const sendNotificationToMany = async (io, userIds, notificationData) => {
  for (const userId of userIds) {
    await sendNotification(io, userId, notificationData);
  }
};

module.exports = { initializeSocket, sendNotification, sendNotificationToMany };