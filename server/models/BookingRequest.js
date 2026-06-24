const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    status: {
      type: String,
      enum: ['notified', 'accepted', 'rejected', 'expired'],
      default: 'notified',
    },
    distance: { type: Number, default: 0 }, // km from customer
    notifiedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
