const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/providerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public
router.get('/', getAllProviders);

// Provider self-management
router.get('/profile', protect, authorize('provider'), getProviderProfile);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);
router.put('/me/online', protect, authorize('provider'), toggleOnlineStatus);
router.put('/me/location', protect, authorize('provider'), updateProviderLocation);

// Admin
router.get('/map', protect, authorize('admin'), getProvidersForMap);
router.get('/admin/all', protect, authorize('admin'), getAllProvidersAdmin);
router.put('/:id/approve', protect, authorize('admin'), approveProvider);
router.put('/:id/suspend', protect, authorize('admin'), suspendProvider);

// Public (must be last to avoid conflicts with /profile, /map etc.)
router.get('/:id', getProviderById);

module.exports = router;
