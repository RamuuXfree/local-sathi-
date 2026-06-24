const Provider = require('../models/Provider');
const Review = require('../models/Review');
const { getAllProviderLocations } = require('../services/locationService');

// @desc    Get all approved providers (public)
// @route   GET /api/providers
// @access  Public
const getAllProviders = async (req, res, next) => {
  try {
    const { category, city, search, page = 1, limit = 12 } = req.query;
    const query = { isApproved: true, isActive: true };

    if (category) query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const providers = await Provider.find(query)
      .select('-password')
      .sort({ 'rating.average': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Provider.countDocuments(query);

    res.status(200).json({
      success: true, count: providers.length, total,
      page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), providers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single provider (public)
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id).select('-password').populate('services');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    const reviews = await Review.find({ providerId: provider._id }).populate('userId', 'name avatar');
    res.status(200).json({ success: true, provider, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider profile (authenticated)
// @route   GET /api/providers/profile
// @access  Private (provider)
const getProviderProfile = async (req, res) => {
  res.status(200).json({ success: true, provider: req.user });
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (provider)
const updateProviderProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'city', 'state', 'skills', 'pricing',
      'bio', 'avatar', 'experience', 'serviceRadius',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const provider = await Provider.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    }).select('-password');

    res.status(200).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle provider online/offline status
// @route   PUT /api/providers/me/online
// @access  Private (provider)
const toggleOnlineStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      req.user._id,
      { isOnline, ...(isOnline ? { isAvailable: true } : {}) },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: `You are now ${isOnline ? 'online' : 'offline'}`,
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider GPS location
// @route   PUT /api/providers/me/location
// @access  Private (provider)
const updateProviderLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng are required' });

    const provider = await Provider.findByIdAndUpdate(
      req.user._id,
      {
        'location.lat': parseFloat(lat),
        'location.lng': parseFloat(lng),
        'location.updatedAt': new Date(),
      },
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, message: 'Location updated', provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all providers with location (admin map)
// @route   GET /api/providers/map
// @access  Private (admin)
const getProvidersForMap = async (req, res, next) => {
  try {
    const providers = await getAllProviderLocations();
    res.status(200).json({ success: true, count: providers.length, providers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all providers for admin
// @route   GET /api/providers/admin/all
// @access  Private (admin)
const getAllProvidersAdmin = async (req, res, next) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const providers = await Provider.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Provider.countDocuments(query);

    res.status(200).json({
      success: true, count: providers.length, total,
      page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), providers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve / Reject provider (admin)
// @route   PUT /api/providers/:id/approve
// @access  Private (admin)
const approveProvider = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).select('-password');

    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    res.status(200).json({
      success: true,
      message: isApproved ? 'Provider approved successfully' : 'Provider rejected',
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend / Activate provider (admin)
// @route   PUT /api/providers/:id/suspend
// @access  Private (admin)
const suspendProvider = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isActive, ...(isActive === false ? { isOnline: false } : {}) },
      { new: true }
    ).select('-password');

    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    res.status(200).json({
      success: true,
      message: isActive ? 'Provider activated' : 'Provider suspended',
      provider,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProviders,
  getProviderById,
  getProviderProfile,
  updateProviderProfile,
  toggleOnlineStatus,
  updateProviderLocation,
  getProvidersForMap,
  getAllProvidersAdmin,
  approveProvider,
  suspendProvider,
};
