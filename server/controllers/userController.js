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
const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Movie = require("../models/Movie");
const User = require("../models/User");
const axios = require("axios");

// / Make sure these are defined globally or within relevant scopes
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const fetchMovieDetails = async (tmdbId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: { api_key: TMDB_API_KEY },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching TMDB details for ${tmdbId}:`, error.message);
    return null; // Return null if fetching fails
  }
};

// @desc    Get all reviews for the logged-in user with pagination
// @route   GET /api/users/me/reviews?page=<num>&limit=<num>&sortBy=<field>&order=<asc|desc>
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id; // From protect middleware

  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 6; // Default limit to 6 reviews per page (adjust as desired)
  const skip = (page - 1) * limit;

  // Optional: Add sorting parameters
  const sortBy = req.query.sortBy || "createdAt"; // Default sort by creation date
  const sortOrder = req.query.order === "asc" ? 1 : -1; // Default descending

  try {
    const totalReviews = await Review.countDocuments({ userId });
    const reviews = await Review.find({ userId })
      .populate("movie", "title tmdbId poster_path") // Also get poster_path for display
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
// @desc    Add a movie to watched or watchlist
// @route   POST /api/users/lists/:listType
// @access  Private
const addMovieToList = asyncHandler(async (req, res) => {
  const { listType } = req.params; // 'watched' or 'watchlist'
  const { tmdbId } = req.body;

  // console.log(
  //   `[addMovieToList] Received request to add ${tmdbId} to ${listType}`
  // );
  // console.log(`[addMovieToList] req.user from protect middleware:`, req.user); // Check what protect middleware provided

  if (!tmdbId || !Number.isInteger(tmdbId)) {
    res.status(400);
    throw new Error("Please provide a valid TMDB movie ID.");
  }

  if (listType !== "watched" && listType !== "watchlist") {
    res.status(400);
    throw new Error('Invalid list type. Must be "watched" or "watchlist".');
  }

  const user = await User.findById(req.user._id);
  // console.log(`[addMovieToList] User fetched from DB:`, user); // VERY IMPORTANT: What does 'user' look like?

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  

  const theList = user[listType];
  
  // Defensive final check before .includes()
  if (!Array.isArray(theList)) {
    console.error(
      `[addMovieToList][CRITICAL ERROR] 'theList' is NOT an array! Value:`,
      theList
    );
    res.status(500); // Internal server error
    throw new Error(
      `Data corruption: User's ${listType} list is not an array. Value: ${JSON.stringify(
        theList
      )}`
    );
  }

  if (theList.includes(tmdbId)) {
    res.status(409); // Conflict
    throw new Error(`Movie already in ${listType} list.`);
  }

  
  // / Optional: If adding to 'watched', remove from 'watchlist' if present
  if (listType === "watched" && user.watchlist.includes(tmdbId)) {
    user.watchlist = user.watchlist.filter((id) => id !== tmdbId);
    user.markModified("watchlist"); // Mark as modified
  }
  // Optional: If adding to 'watchlist', remove from 'watched' if present
  if (listType === "watchlist" && user.watched.includes(tmdbId)) {
    user.watched = user.watched.filter((id) => id !== tmdbId);
    user.markModified("watched"); // Mark as modified
  }

  user[listType].push(tmdbId);
  user.markModified(listType); // Mark the target list as modified

  await user.save();

  // --- Crucial Fix: Re-fetch the user to get the latest state of arrays from DB ---
  // OR, more efficiently, use the updated 'user' object's arrays and fetch details for them.
  const updatedUser = await User.findById(user._id); // Re-fetch the user document

  if (!updatedUser) {
    res.status(500);
    throw new Error("Could not re-fetch user after save for list update.");
  }

  // Fetch TMDB details for the updated watched and watchlist movie IDs
  const watchedMovieIds = updatedUser.watched || [];
  const watchlistMovieIds = updatedUser.slice || []; // This was a typo from earlier, should be updatedUser.watchlist

  // Corrected to use updatedUser.watched and updatedUser.watchlist
  const fetchedWatchedMovies = await Promise.all(
    updatedUser.watched.map(fetchMovieDetails)
  );
  const validFetchedWatchedMovies = fetchedWatchedMovies.filter(Boolean);

  const fetchedWatchlistMovies = await Promise.all(
    updatedUser.watchlist.map(fetchMovieDetails)
  );
  const validFetchedWatchlistMovies = fetchedWatchlistMovies.filter(Boolean);

  const responseData = {
    message: `Movie added to ${listType} list.`,
    watchedMovies: validFetchedWatchedMovies, // Ensure this matches what frontend expects
    watchlistMovies: validFetchedWatchlistMovies, // Ensure this matches what frontend expects
  };


  res.status(200).json(responseData);
});

// @desc    Remove a movie from watched or watchlist
// @route   DELETE /api/users/lists/:listType/:tmdbId
// @access  Private
const removeMovieFromList = asyncHandler(async (req, res) => {
  
  const { listType, tmdbId } = req.params; // 'watched' or 'watchlist'
  const numericTmdbId = parseInt(tmdbId, 10); // Ensure it's a number

  if (!numericTmdbId || !Number.isInteger(numericTmdbId)) {
    res.status(400);
    throw new Error("Please provide a valid TMDB movie ID.");
  }

  if (listType !== "watched" && listType !== "watchlist") {
    res.status(400);
    throw new Error('Invalid list type. Must be "watched" or "watchlist".');
  }

  let user = await User.findById(req.user._id); // Use 'let' to allow reassigning

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Ensure the list is an array before filtering
  if (!user[listType] || !Array.isArray(user[listType])) {
    user[listType] = [];
    user.markModified(listType);
  }

  let list = user[listType]; // Get the correct array

  if (!list.includes(numericTmdbId)) {
    res.status(404);
    throw new Error(`Movie not found in ${listType} list.`);
  }

  user[listType] = list.filter((id) => id !== numericTmdbId);
  user.markModified(listType); // Mark as modified after filtering (creates a new array)
  await user.save();

  // --- Crucial Fix: Re-fetch the user to get the latest state of arrays from DB ---
  const updatedUser = await User.findById(user._id); // Re-fetch the user document

  if (!updatedUser) {
    res.status(500);
    throw new Error("Could not re-fetch user after save for list update.");
  }

  // Fetch TMDB details for the updated watched and watchlist movie IDs
  const fetchedWatchedMovies = await Promise.all(
    updatedUser.watched.map(fetchMovieDetails)
  );
  const validFetchedWatchedMovies = fetchedWatchedMovies.filter(Boolean);

  const fetchedWatchlistMovies = await Promise.all(
    updatedUser.watchlist.map(fetchMovieDetails)
  );
  const validFetchedWatchlistMovies = fetchedWatchlistMovies.filter(Boolean);

  const responseData = {
    message: `Movie removed from ${listType} list.`,
    watchedMovies: validFetchedWatchedMovies, // Ensure this matches what frontend expects
    watchlistMovies: validFetchedWatchlistMovies, // Ensure this matches what frontend expects
  };
  res.status(200).json(responseData);
});

// @desc    Get a user's watched and watchlist movies with TMDB details
// @route   GET /api/users/lists
// @access  Private
const getUserMovieLists = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const fetchMovieDetails = async (tmdbId) => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
        params: { api_key: TMDB_API_KEY },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching TMDB details for ${tmdbId}:`,
        error.message
      );
      return null; // Return null or handle error as needed
    }
  };
// server/controllers/userController.js



  // Fetch details for all watched movies concurrently
  const watchedMoviesDetails = await Promise.all(
    user.watched.map(fetchMovieDetails)
  );
  // Filter out any nulls if TMDB fetching failed
  const validWatchedMovies = watchedMoviesDetails.filter(
    (movie) => movie !== null
  );

  // Fetch details for all watchlist movies concurrently
  const watchlistMoviesDetails = await Promise.all(
    user.watchlist.map(fetchMovieDetails)
  );
  // Filter out any nulls if TMDB fetching failed
  const validWatchlistMovies = watchlistMoviesDetails.filter(
    (movie) => movie !== null
  );

  res.status(200).json({
    watchedMovies: validWatchedMovies,
    watchlistMovies: validWatchlistMovies,
  });
});

module.exports = {
  getUserReviews,
  addMovieToList, // Export new functions
  removeMovieFromList, // Export new functions
  getUserMovieLists, // Export new functions
};
