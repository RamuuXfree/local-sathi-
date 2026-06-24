const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  addAdminNote,
  getApplicationStats,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All routes require admin authentication
router.use(protect, authorize('admin'));

router.get('/stats', getApplicationStats);
router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', updateApplicationStatus);
router.put('/:id/note', addAdminNote);

module.exports = router;
