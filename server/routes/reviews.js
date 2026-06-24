const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews, getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('user'), createReview);
router.get('/my-reviews', protect, authorize('provider'), getMyReviews);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
