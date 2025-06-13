// server/routes/userRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserReviews } = require('../controllers/userController'); // We will create this controller

const router = express.Router();

// @route   GET /api/users/me/reviews
// @desc    Get all reviews for the logged-in user
// @access  Private
router.get('/me/reviews', protect, getUserReviews);

module.exports = router;