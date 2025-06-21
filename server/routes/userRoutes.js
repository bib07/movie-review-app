// server/routes/userRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getUserReviews,
  addMovieToList,
  removeMovieFromList,
  getUserMovieLists,
} = require("../controllers/userController"); // We will create this controller

const router = express.Router();

// @route   GET /api/users/me/reviews
// @desc    Get all reviews for the logged-in user
// @access  Private
router.get("/me/reviews", protect, getUserReviews);

// Add a movie to watched or watchlist
// POST /api/users/lists/:listType (e.g., /api/users/lists/watched or /api/users/lists/watchlist)
router.post('/lists/:listType', protect, addMovieToList);
// Remove a movie from watched or watchlist
// DELETE /api/users/lists/:listType/:tmdbId
router.delete('/lists/:listType/:tmdbId', protect, removeMovieFromList);
// Get a user's watched and watchlist movies
// GET /api/users/lists
router.get('/lists', protect, getUserMovieLists);

module.exports = router;
