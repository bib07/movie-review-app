// // server/controllers/userController.js
// const asyncHandler = require('express-async-handler');
// const Review = require('../models/Review'); 
// const Movie = require('../models/Movie'); 

// // @desc    Get all reviews for the logged-in user
// // @route   GET /api/users/me/reviews
// // @access  Private
// const getUserReviews = asyncHandler(async (req, res) => {
//   // req.user.id comes from the protect middleware after JWT verification
//   const userId = req.user.id;

//   // Find all reviews by this user, and populate the 'movie' field to get movie details
//   const reviews = await Review.find({ userId })
//     .populate('movie', 'title tmdbId') // Populate 'movie' field, only select 'title' and 'tmdbId'
//     .sort({ createdAt: -1 }); // Sort by newest reviews first

//   res.status(200).json(reviews);
// });

// module.exports = {
//   getUserReviews,
// };

// server/controllers/userController.js (Update this file)
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Get all reviews for the logged-in user with pagination
// @route   GET /api/users/me/reviews?page=<num>&limit=<num>&sortBy=<field>&order=<asc|desc>
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id; // From protect middleware

  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 6; // Default limit to 6 reviews per page (adjust as desired)
  const skip = (page - 1) * limit;

  // Optional: Add sorting parameters
  const sortBy = req.query.sortBy || 'createdAt'; // Default sort by creation date
  const sortOrder = req.query.order === 'asc' ? 1 : -1; // Default descending

  try {
    const totalReviews = await Review.countDocuments({ userId });
    const reviews = await Review.find({ userId })
      .populate('movie', 'title tmdbId poster_path') // Also get poster_path for display
      .sort({ [sortBy]: sortOrder }) // Apply sorting
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      reviews,
      page,
      limit,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
    });
  } catch (error) {
    console.error("Error fetching user reviews with pagination:", error);
    res.status(500).json({ message: "Server Error: Could not fetch reviews." });
  }
});

module.exports = {
  getUserReviews,
};