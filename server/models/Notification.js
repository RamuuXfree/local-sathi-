const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientModel',
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ['User', 'Provider'],
    },
    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_accepted',
        'booking_rejected',
        'booking_completed',
        'booking_cancelled',
        'review_received',
        'payment_received',
        'general',
      ],
      default: 'general',
    },
    title: {
      type: String,
      default: 'Notification',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
