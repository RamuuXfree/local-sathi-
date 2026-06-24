const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Review = require('../models/Review');

// @desc    Get admin analytics/overview
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProviders,
      approvedProviders,
      pendingProviders,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalServices,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Provider.countDocuments(),
      Provider.countDocuments({ isApproved: true }),
      Provider.countDocuments({ isApproved: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Service.countDocuments({ isActive: true }),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    // Monthly bookings for chart
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    // Category distribution
    const categoryStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$service.category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalProviders,
        approvedProviders,
        pendingProviders,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalServices,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyBookings,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent bookings for admin
// @route   GET /api/admin/bookings/recent
// @access  Private (admin)
const getRecentBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('providerId', 'name')
      .populate('serviceId', 'title category')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top performing providers
// @route   GET /api/admin/providers/top
// @access  Private (admin)
const getTopProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({ isApproved: true })
      .select('-password')
      .sort({ completedJobs: -1, 'rating.average': -1 })
      .limit(10);

    res.status(200).json({ success: true, providers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, getRecentBookings, getTopProviders };
