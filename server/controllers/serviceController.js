const Service = require('../models/Service');
const Provider = require('../models/Provider');

// @desc    Get all services (public)
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const services = await Service.find(query)
      .populate('providerId', 'name city rating avatar isApproved')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter only from approved providers
    const filteredServices = services.filter(
      (s) => s.providerId && s.providerId.isApproved
    );

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filteredServices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      services: filteredServices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      'providerId',
      'name city rating avatar experience bio skills isApproved'
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service
// @route   POST /api/services
// @access  Private (provider)
const createService = async (req, res, next) => {
  try {
    const { title, category, description, price, priceUnit, duration, images, tags } = req.body;

    const service = await Service.create({
      title, category, description, price,
      priceUnit: priceUnit || 'per visit',
      duration: duration || '1-2 hours',
      images: images || [],
      tags: tags || [],
      providerId: req.user._id,
    });

    // Add service to provider's services array
    await Provider.findByIdAndUpdate(req.user._id, {
      $push: { services: service._id },
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (provider)
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, service: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (provider)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await service.deleteOne();
    await Provider.findByIdAndUpdate(req.user._id, {
      $pull: { services: service._id },
    });

    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider's own services
// @route   GET /api/services/my-services
// @access  Private (provider)
const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ providerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
};
