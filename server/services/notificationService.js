const Notification = require('../models/Notification');
const socket = require('../config/socket');

/**
 * Create a notification and emit via Socket.io
 */
const createNotification = async ({
  recipientId,
  recipientModel,
  type,
  title,
  message,
  relatedId,
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientModel,
      type,
      title,
      message,
      relatedId,
    });

    // Emit real-time notification
    try {
      const io = socket.getIO();
      io.to(recipientId.toString()).emit('notification:new', notification);
    } catch (socketError) {
      // Socket may not be initialized in tests
      console.log('Socket emit skipped:', socketError.message);
    }

    return notification;
  } catch (error) {
    console.error('❌ Notification creation error:', error.message);
  }
};

module.exports = { createNotification };
