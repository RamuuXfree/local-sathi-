const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('user'), createBooking);
router.get('/incoming', protect, authorize('provider'), getIncomingJobs);
router.get('/user', protect, authorize('user'), getUserBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.get('/admin', protect, authorize('admin'), getAllBookings);
router.put('/:id/accept', protect, authorize('provider'), acceptBooking);
router.put('/:id/reject-request', protect, authorize('provider'), rejectBookingRequest);
router.put('/:id/status', protect, authorize('provider'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);
router.put('/:id/assign', protect, authorize('admin'), adminAssignProvider);
router.get('/:id', protect, getBookingById);

module.exports = router;
