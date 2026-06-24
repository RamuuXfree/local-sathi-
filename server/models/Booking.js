const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional — assigned after provider accepts (auto-match flow)
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      default: null,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    // Category drives auto-matching when no specific service/provider chosen
    category: {
      type: String,
      enum: ['Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Appliance Repair', 'Other', ''],
      default: '',
    },
    bookingType: {
      type: String,
      enum: ['auto', 'direct'],
      default: 'auto',
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    bookingTime: {
      type: String,
      required: [true, 'Booking time is required'],
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    // GPS coordinates from customer at time of booking
    customerLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' }, // reverse-geocoded display string
    },
    notes: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    // Tracks the provider-matching phase
    matchingStatus: {
      type: String,
      enum: ['not_required', 'searching', 'assigned', 'failed'],
      default: 'not_required',
    },
    // Providers who received job alert notifications
    notifiedProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
    acceptedAt: { type: Date },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
