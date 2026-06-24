const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getAllServices);
router.get('/my-services', protect, authorize('provider'), getMyServices);
router.post('/', protect, authorize('provider'), createService);
router.get('/:id', getServiceById);
router.put('/:id', protect, authorize('provider'), updateService);
router.delete('/:id', protect, authorize('provider'), deleteService);

module.exports = router;
