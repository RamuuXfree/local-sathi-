const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Update provider rating after review is saved
reviewSchema.post('save', async function () {
  const Provider = require('./Provider');
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ providerId: this.providerId });
  const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await Provider.findByIdAndUpdate(this.providerId, {
    'rating.average': Math.round(avg * 10) / 10,
    'rating.count': reviews.length,
  });
});

module.exports = mongoose.model('Review', reviewSchema);
