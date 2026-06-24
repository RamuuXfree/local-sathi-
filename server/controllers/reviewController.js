const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (user)
const createReview = async (req, res, next) => {
  try {
    const { bookingId, providerId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings',
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already submitted for this booking' });
    }

    const review = await Review.create({
      userId: req.user._id,
      providerId,
      bookingId,
      rating,
      comment,
    });

    await Booking.findByIdAndUpdate(bookingId, { reviewId: review._id });

    const populated = await Review.findById(review._id).populate('userId', 'name avatar');
    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for logged-in provider
// @route   GET /api/reviews/my-reviews
// @access  Private (provider)
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.user._id })
      .populate('userId', 'name avatar')
      .populate('bookingId', 'bookingDate serviceId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getProviderReviews, getMyReviews };
