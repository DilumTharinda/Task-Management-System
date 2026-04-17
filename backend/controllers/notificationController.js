const Notification = require('../models/Notification');

// GET /api/notifications — get all notifications for logged in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return res.status(200).json({
      message: 'Notifications fetched successfully',
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ errorCode: 500, message: 'Internal Server Error', description: 'Something went wrong' });
  }
};

// GET /api/notifications/unread-count — get count of unread notifications
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.userId, isRead: false }
    });
    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('Unread count error:', error);
    return res.status(500).json({ errorCode: 500, message: 'Internal Server Error', description: 'Something went wrong' });
  }
};

// PATCH /api/notifications/:id/read — mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!notification) {
      return res.status(404).json({ errorCode: 404, message: 'Not Found', description: 'Notification not found' });
    }

    await notification.update({ isRead: true });
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ errorCode: 500, message: 'Internal Server Error', description: 'Something went wrong' });
  }
};

// PATCH /api/notifications/read-all — mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.userId, isRead: false } }
    );
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ errorCode: 500, message: 'Internal Server Error', description: 'Something went wrong' });
  }
};

// DELETE /api/notifications/:id — delete one notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!notification) {
      return res.status(404).json({ errorCode: 404, message: 'Not Found', description: 'Notification not found' });
    }

    await notification.destroy();
    return res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ errorCode: 500, message: 'Internal Server Error', description: 'Something went wrong' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};