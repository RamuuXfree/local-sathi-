const Booking = require('../models/Booking');
const BookingRequest = require('../models/BookingRequest');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { findNearbyProviders } = require('../services/locationService');
const { sendBookingConfirmationSMS, sendNewBookingAlertSMS, sendBookingStatusSMS } = require('../services/twilioService');
const { sendBookingConfirmationWA, sendBookingStatusWA } = require('../services/whatsappService');
const socket = require('../config/socket');

// ─── Helper ──────────────────────────────────────────────────────────────────
const emitSafe = (room, event, data) => {
  try { socket.getIO().to(room).emit(event, data); } catch (_) {}
};

// ─── CREATE BOOKING (auto-match OR direct) ───────────────────────────────────
// @route   POST /api/bookings
// @access  Private (user)
const createBooking = async (req, res, next) => {
  try {
    const {
      serviceId, category, bookingDate, bookingTime,
      address, notes, amount,
      customerLat, customerLng, customerAddress,
    } = req.body;

    let resolvedCategory = category;
    let resolvedAmount = amount;
    let service = null;

    if (serviceId) {
      service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      resolvedCategory = resolvedCategory || service.category;
      resolvedAmount = resolvedAmount || service.price;
    }

    if (!resolvedCategory) {
      return res.status(400).json({ success: false, message: 'Service category is required' });
    }

    const hasLocation = !!(customerLat && customerLng);

    const booking = await Booking.create({
      userId: req.user._id,
      serviceId: serviceId || null,
      category: resolvedCategory,
      bookingDate,
      bookingTime,
      address: address || {},
      notes: notes || '',
      amount: resolvedAmount || 0,
      status: 'pending',
      bookingType: hasLocation ? 'auto' : 'direct',
      matchingStatus: hasLocation ? 'searching' : 'not_required',
      customerLocation: hasLocation
        ? { lat: parseFloat(customerLat), lng: parseFloat(customerLng), address: customerAddress || '' }
        : { lat: null, lng: null, address: '' },
      statusHistory: [{ status: 'pending', note: 'Booking created — searching for providers' }],
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    // ── Auto-match: find & notify nearby providers ────────────────────────────
    if (hasLocation) {
      const nearby = await findNearbyProviders(
        parseFloat(customerLat),
        parseFloat(customerLng),
        resolvedCategory
      );

      if (nearby.length === 0) {
        await Booking.findByIdAndUpdate(booking._id, { matchingStatus: 'failed' });
        emitSafe(req.user._id.toString(), 'booking:noProviders', {
          bookingId: booking._id,
          message: `No ${resolvedCategory} providers are online nearby. Please try again later.`,
        });
      } else {
        const notifiedIds = nearby.map((n) => n.provider._id);
        await Booking.findByIdAndUpdate(booking._id, { notifiedProviders: notifiedIds });

        const expiresAt = new Date(Date.now() + 90 * 1000); // 90s

        for (const { provider, distance } of nearby) {
          await BookingRequest.create({
            bookingId: booking._id,
            providerId: provider._id,
            distance,
            notifiedAt: new Date(),
            expiresAt,
          });

          emitSafe(provider._id.toString(), 'booking:nearbyJob', {
            bookingId: booking._id,
            category: resolvedCategory,
            distance,
            customerArea: address?.city || customerAddress || 'Nearby',
            bookingDate,
            bookingTime,
            address: { city: address?.city || '', street: address?.street || '' },
            amount: resolvedAmount,
            expiresIn: 90,
            customerName: req.user.name,
          });

          await createNotification({
            recipientId: provider._id,
            recipientModel: 'Provider',
            type: 'booking_created',
            title: `🔔 New ${resolvedCategory} Job — ${distance} km away`,
            message: `Customer in ${address?.city || 'your area'} needs ${resolvedCategory} service on ${new Date(bookingDate).toLocaleDateString('en-IN')}. Tap to accept!`,
            relatedId: booking._id,
          });
        }
      }
    }

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name phone email')
      .populate('serviceId', 'title category');

    res.status(201).json({ success: true, booking: populated });
  } catch (error) {
    next(error);
  }
};

// ─── PROVIDER ACCEPTS BOOKING (first-accept wins, atomic) ────────────────────
// @route   PUT /api/bookings/:id/accept
// @access  Private (provider)
const acceptBooking = async (req, res, next) => {
  try {
    const providerId = req.user._id;

    // Atomic update — only proceeds if matchingStatus is still 'searching'
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, matchingStatus: 'searching' },
      {
        providerId,
        matchingStatus: 'assigned',
        status: 'accepted',
        acceptedAt: new Date(),
        $push: { statusHistory: { status: 'accepted', note: 'Provider accepted the booking' } },
      },
      { new: true }
    )
      .populate('userId', 'name phone email')
      .populate('serviceId', 'title category');

    if (!booking) {
      return res.status(409).json({
        success: false,
        message: 'This job has already been taken by another provider.',
      });
    }

    const provider = await Provider.findById(providerId).select('name phone avatar city rating completedJobs');

    // Update this provider's request
    await BookingRequest.findOneAndUpdate(
      { bookingId: booking._id, providerId },
      { status: 'accepted', respondedAt: new Date() }
    );

    // Expire all other provider requests
    await BookingRequest.updateMany(
      { bookingId: booking._id, providerId: { $ne: providerId } },
      { status: 'expired', respondedAt: new Date() }
    );

    // Provider is now on a job
    await Provider.findByIdAndUpdate(providerId, { isAvailable: false });

    // Notify customer — provider assigned
    emitSafe(booking.userId._id.toString(), 'booking:accepted', {
      bookingId: booking._id,
      provider: {
        _id: provider._id,
        name: provider.name,
        phone: provider.phone, // revealed after acceptance
        avatar: provider.avatar,
        city: provider.city,
        rating: provider.rating,
        completedJobs: provider.completedJobs,
      },
      message: `${provider.name} has accepted your booking and is on the way!`,
    });

    // Notify other providers — job taken
    (booking.notifiedProviders || []).forEach((pid) => {
      if (pid.toString() !== providerId.toString()) {
        emitSafe(pid.toString(), 'booking:jobTaken', {
          bookingId: booking._id,
          message: 'This job has been taken by another provider.',
        });
      }
    });

    // DB notification for customer
    await createNotification({
      recipientId: booking.userId._id,
      recipientModel: 'User',
      type: 'booking_accepted',
      title: '✅ Provider Assigned!',
      message: `${provider.name} has accepted your ${booking.category} booking. You can now call them.`,
      relatedId: booking._id,
    });

    res.status(200).json({ success: true, message: 'Booking accepted!', booking, provider });
  } catch (error) {
    next(error);
  }
};

// ─── PROVIDER REJECTS JOB REQUEST ────────────────────────────────────────────
// @route   PUT /api/bookings/:id/reject-request
// @access  Private (provider)
const rejectBookingRequest = async (req, res, next) => {
  try {
    await BookingRequest.findOneAndUpdate(
      { bookingId: req.params.id, providerId: req.user._id, status: 'notified' },
      { status: 'rejected', respondedAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'Job request rejected' });
  } catch (error) {
    next(error);
  }
};

// ─── GET INCOMING JOBS (provider's pending alerts) ────────────────────────────
// @route   GET /api/bookings/incoming
// @access  Private (provider)
const getIncomingJobs = async (req, res, next) => {
  try {
    const requests = await BookingRequest.find({
      providerId: req.user._id,
      status: 'notified',
    })
      .populate({
        path: 'bookingId',
        select: 'category bookingDate bookingTime address amount customerLocation status matchingStatus userId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ notifiedAt: -1 });

    const active = requests.filter(
      (r) => r.bookingId && r.bookingId.matchingStatus === 'searching'
    );

    res.status(200).json({ success: true, count: active.length, requests: active });
  } catch (error) {
    next(error);
  }
};

// ─── GET USER BOOKINGS ────────────────────────────────────────────────────────
// @route   GET /api/bookings/user
// @access  Private (user)
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('providerId', 'name phone avatar city rating')
      .populate('serviceId', 'title category images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// ─── GET PROVIDER BOOKINGS ────────────────────────────────────────────────────
// @route   GET /api/bookings/provider
// @access  Private (provider)
const getProviderBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { providerId: req.user._id };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate('userId', 'name phone avatar address')
      .populate('serviceId', 'title category price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE BOOKING STATUS (provider) ────────────────────────────────────────
// @route   PUT /api/bookings/:id/status
// @access  Private (provider)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('serviceId', 'title');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    booking.status = status;
    booking.statusHistory.push({ status, note: note || `Status changed to ${status}` });

    if (status === 'completed') {
      await Provider.findByIdAndUpdate(req.user._id, {
        $inc: { completedJobs: 1, totalEarnings: booking.amount },
        isAvailable: true,
      });
    }
    if (status === 'in-progress') {
      await Provider.findByIdAndUpdate(req.user._id, { isAvailable: false });
    }

    await booking.save();

    emitSafe(booking.userId._id.toString(), 'booking:statusUpdate', {
      bookingId: booking._id,
      status,
      message: `Your ${booking.serviceId?.title || booking.category} booking is now ${status}`,
    });

    await createNotification({
      recipientId: booking.userId._id,
      recipientModel: 'User',
      type: `booking_${status}`,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your booking for "${booking.serviceId?.title || booking.category}" has been updated to ${status}`,
      relatedId: booking._id,
    });

    const bookingDetails = {
      service: booking.serviceId?.title || booking.category,
      date: new Date(booking.bookingDate).toLocaleDateString('en-IN'),
      time: booking.bookingTime,
    };
    sendBookingStatusSMS(booking.userId.phone, status, bookingDetails).catch(() => {});
    sendBookingStatusWA(booking.userId.phone, status, bookingDetails).catch(() => {});

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// ─── CANCEL BOOKING (user) ────────────────────────────────────────────────────
// @route   PUT /api/bookings/:id/cancel
// @access  Private (user)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId', 'title')
      .populate('providerId', 'phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });

    booking.status = 'cancelled';
    booking.matchingStatus = 'failed';
    booking.statusHistory.push({ status: 'cancelled', note: 'Cancelled by user' });
    await booking.save();

    if (booking.providerId) {
      await Provider.findByIdAndUpdate(booking.providerId._id, { isAvailable: true });
      emitSafe(booking.providerId._id.toString(), 'booking:cancelled', {
        bookingId: booking._id,
        message: `Booking for ${booking.serviceId?.title || booking.category} was cancelled by customer`,
      });
    }

    // Notify all notified providers
    (booking.notifiedProviders || []).forEach((pid) => {
      emitSafe(pid.toString(), 'booking:jobTaken', {
        bookingId: booking._id,
        message: 'This booking has been cancelled by the customer.',
      });
    });

    res.status(200).json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL BOOKINGS (admin) ─────────────────────────────────────────────────
// @route   GET /api/bookings/admin
// @access  Private (admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name email phone')
        .populate('providerId', 'name email phone')
        .populate('serviceId', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);
    res.status(200).json({
      success: true, count: bookings.length, total,
      page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN MANUALLY ASSIGN PROVIDER ─────────────────────────────────────────
// @route   PUT /api/bookings/:id/assign
// @access  Private (admin)
const adminAssignProvider = async (req, res, next) => {
  try {
    const { providerId } = req.body;
    const provider = await Provider.findById(providerId).select('name phone city avatar');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        providerId,
        status: 'accepted',
        matchingStatus: 'assigned',
        acceptedAt: new Date(),
        $push: { statusHistory: { status: 'accepted', note: 'Manually assigned by admin' } },
      },
      { new: true }
    ).populate('userId', 'name phone email').populate('serviceId', 'title category');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    emitSafe(booking.userId._id.toString(), 'booking:accepted', {
      bookingId: booking._id,
      provider: { _id: provider._id, name: provider.name, phone: provider.phone, city: provider.city },
      message: `${provider.name} has been assigned to your booking by admin.`,
    });

    emitSafe(providerId.toString(), 'booking:nearbyJob', {
      bookingId: booking._id,
      category: booking.category,
      customerArea: booking.address?.city || '',
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      amount: booking.amount,
      adminAssigned: true,
    });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE BOOKING ───────────────────────────────────────────────────────
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name phone email avatar')
      .populate('providerId', 'name phone email avatar city rating')
      .populate('serviceId', 'title category price description');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Mask phone numbers if booking not yet accepted
    if (booking.status === 'pending' || booking.matchingStatus === 'searching') {
      if (booking.providerId) booking.providerId.phone = '**masked**';
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  acceptBooking,
  rejectBookingRequest,
  getIncomingJobs,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  adminAssignProvider,
  getBookingById,
};
