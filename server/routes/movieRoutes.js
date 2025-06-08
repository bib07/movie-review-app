// server/routes/movieRoutes.js
const express = require('express');
const {
  searchMovies,
  getMovieExternalDetails,
  getReviewedMovies,
  getLocalMovieEntry,
  submitReviewAndRating,
  getMovieReviews,
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware'); // Only protect is needed for submitting reviews

const router = express.Router();

// TMDB Proxy Routes (Public)
router.route('/search').get(searchMovies); // Search movies on TMDB
router.route('/tmdb/:tmdbId').get(getMovieExternalDetails); // Get full details for a TMDB movie

// Our Local DB Routes (Public)
router.route('/reviewed').get(getReviewedMovies); // Get movies that have local reviews/ratings
router.route('/:tmdbId/local').get(getLocalMovieEntry); // Get local movie entry by TMDB ID
router.route('/:tmdbId/reviews').get(getMovieReviews); // Get reviews for a specific movie (local DB)

// User-specific actions (Protected)
router.route('/:tmdbId/reviews').post(protect, submitReviewAndRating); // Submit a review/rating

module.exports = router;