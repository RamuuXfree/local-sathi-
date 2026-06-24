const Provider = require('../models/Provider');
const Notification = require('../models/Notification');
const { createNotification } = require('../services/notificationService');
const socket = require('../config/socket');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Emit a socket event to a provider's room
 */
const emitToProvider = (providerId, event, data) => {
  try {
    const io = socket.getIO();
    io.to(providerId.toString()).emit(event, data);
  } catch (_) {}
};

// ─── GET ALL APPLICATIONS ────────────────────────────────────────────────────
// @route   GET /api/applications
// @access  Private (admin)
const getAllApplications = async (req, res, next) => {
  try {
    const {
      status,
      category,
      city,
      search,
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status && status !== 'all') query.applicationStatus = status;
    if (category) query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total, stats] = await Promise.all([
      Provider.find(query)
        .select('-password')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Provider.countDocuments(query),
      // Stats for the header cards
      Provider.aggregate([
        {
          $group: {
            _id: '$applicationStatus',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Convert stats array to object
    const statsObj = { pending: 0, approved: 0, rejected: 0, hold: 0, total: 0 };
    stats.forEach(s => {
      if (s._id) statsObj[s._id] = s.count;
      statsObj.total += s.count;
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: statsObj,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE APPLICATION ───────────────────────────────────────────────────
// @route   GET /api/applications/:id
// @access  Private (admin)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Provider.findById(req.params.id)
      .select('-password')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE APPLICATION STATUS ────────────────────────────────────────────────
// @route   PUT /api/applications/:id/status
// @access  Private (admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, adminNotes } = req.body;

    if (!['approved', 'rejected', 'hold', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Update fields
    provider.applicationStatus = status;
    provider.reviewedBy = req.user._id;
    provider.reviewedAt = new Date();

    if (adminNotes !== undefined) provider.adminNotes = adminNotes;
    if (rejectionReason !== undefined) provider.rejectionReason = rejectionReason;

    // Special logic: Approval converts to active provider
    if (status === 'approved') {
      provider.isApproved = true;
      provider.rejectionReason = '';
    } else if (status === 'rejected') {
      provider.isApproved = false;
    } else if (status === 'hold') {
      provider.isApproved = false;
    }

    await provider.save({ validateModifiedOnly: true });

    // ─── Create in-app notification ───────────────────────────────────
    const notificationData = {
      recipientId: provider._id,
      recipientModel: 'Provider',
      relatedId: provider._id,
    };

    if (status === 'approved') {
      notificationData.type = 'provider_approved';
      notificationData.title = '🎉 Application Approved!';
      notificationData.message =
        'Congratulations! Your LocalSaathi provider application has been approved. You can now accept bookings and manage your services.';
    } else if (status === 'rejected') {
      notificationData.type = 'general';
      notificationData.title = '❌ Application Update';
      notificationData.message = rejectionReason
        ? `Your provider application has been reviewed. Reason: ${rejectionReason}`
        : 'Your provider application was not approved at this time. Please contact support for details.';
    } else if (status === 'hold') {
      notificationData.type = 'general';
      notificationData.title = '⏳ Application On Hold';
      notificationData.message =
        'Your application is currently under review. We may contact you for additional information.';
    }

    await createNotification(notificationData);

    // ─── Real-time socket push to provider ────────────────────────────
    emitToProvider(provider._id, 'application:statusUpdate', {
      status,
      message: notificationData.message,
    });

    const updatedProvider = await Provider.findById(provider._id)
      .select('-password')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application: updatedProvider,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADD ADMIN NOTE ───────────────────────────────────────────────────────────
// @route   PUT /api/applications/:id/note
// @access  Private (admin)
const addAdminNote = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { adminNotes, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, message: 'Note saved', application: provider });
  } catch (error) {
    next(error);
  }
};

// ─── GET APPLICATION STATS ────────────────────────────────────────────────────
// @route   GET /api/applications/stats
// @access  Private (admin)
const getApplicationStats = async (req, res, next) => {
  try {
    const [statusStats, categoryStats, recentApplications] = await Promise.all([
      Provider.aggregate([
        { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
      ]),
      Provider.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Provider.find({ applicationStatus: 'pending' })
        .select('name email category city submittedAt createdAt')
        .sort({ submittedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const stats = { pending: 0, approved: 0, rejected: 0, hold: 0, total: 0 };
    statusStats.forEach(s => {
      if (s._id) stats[s._id] = s.count;
      stats.total += s.count;
    });

    res.status(200).json({
      success: true,
      stats,
      categoryStats,
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  addAdminNote,
  getApplicationStats,
};
