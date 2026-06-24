const express = require('express');
const router = express.Router();
const { getAnalytics, getRecentBookings, getTopProviders } = require('../controllers/adminController');
const { getAllProvidersAdmin, approveProvider } = require('../controllers/providerController');
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { getAllBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/bookings/recent', getRecentBookings);
router.get('/providers/top', getTopProviders);
router.get('/providers', getAllProvidersAdmin);
router.put('/providers/:id/approve', approveProvider);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);

module.exports = router;
