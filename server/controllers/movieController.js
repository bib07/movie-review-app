// server/controllers/movieController.js
const asyncHandler = require("express-async-handler");
const axios = require("axios"); 
const Movie = require("../models/Movie"); // Our local Movie model


const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";


console.log("TMDB_API_KEY loaded:", TMDB_API_KEY ? "Yes" : "No"); // Check if it's there
console.log("TMDB_BASE_URL:", TMDB_BASE_URL);

// @desc    Search movies from TMDB
// @route   GET /api/movies/search?query=:keyword
// @access  Public
const searchMovies = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error("Please provide a search query.");
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      "TMDB Search Error:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500);
    throw new Error("Could not search movies from external API.");
  }
});

// @desc    Get movie details from TMDB by TMDB ID
// @route   GET /api/movies/tmdb/:tmdbId
// @access  Public
const getMovieExternalDetails = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;

  // Add console.log here to see what tmdbId is
  console.log("Received tmdbId:", tmdbId);

  // Construct the full URL for TMDB
  const requestUrl = `${TMDB_BASE_URL}/movie/${tmdbId}`;
  console.log("Attempting to fetch from URL:", requestUrl);
  console.log(
    "Using API Key (first 5 chars):",
    TMDB_API_KEY ? TMDB_API_KEY.substring(0, 5) + "..." : "Undefined/Empty"
  );

  try {
    const response = await axios.get(requestUrl, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "videos,credits,reviews", // Get trailers and cast/crew
      },
    });
    res.json(response.data);
  } catch (error) {
    // This will now print more detail about the error from axios
    console.error("TMDB Details Error:", error.message); // This is likely 'Invalid URL'
    console.error("Axios Error Config:", error.config); // This shows the request config axios used
    console.error("Axios Error Response Data (if any):", error.response?.data); // TMDB's error response
    console.error("Axios Error Status (if any):", error.response?.status); // TMDB's error status
    res.status(error.response?.status || 500);
    throw new Error("Could not fetch movie details from external API.");
  }
});

// @desc    Get movies that have been reviewed/rated by our users
// @route   GET /api/movies/reviewed
// @access  Public
const getReviewedMovies = asyncHandler(async (req, res) => {
  // This will fetch a list of movies that have entries in our DB
  // We can later extend this to fetch full TMDB details for each if needed,
  // or rely on frontend to fetch details for display.
  const movies = await Movie.find({});
  res.json(movies);
});

// @desc    Get a single movie entry from our DB by TMDB ID (for its aggregates)
// @route   GET /api/movies/:tmdbId/local
// @access  Public
const getLocalMovieEntry = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const movie = await Movie.findOne({ tmdbId });

  if (movie) {
    res.json(movie);
  } else {
    res.status(404);
    throw new Error("Movie not found in local database (no reviews yet)");
  }
});

// @desc    Add a review/rating to a movie (or update existing)
// @route   POST /api/movies/:tmdbId/reviews
// @access  Private
const submitReviewAndRating = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const { rating, reviewText, movieTitle } = req.body; // movieTitle passed from frontend for local storage

  if (!rating || rating < 0 || rating > 5) {
    res.status(400);
    throw new Error("Please provide a valid rating (0-5).");
  }
  if (!movieTitle) {
    res.status(400);
    throw new Error("Movie title is required.");
  }
  // Note: `reviewText` can be optional

  // Find or create the movie entry in our local database
  let movie = await Movie.findOne({ tmdbId });

  if (!movie) {
    // If movie not in our DB, create a new entry for it
    movie = await Movie.create({
      tmdbId,
      title: movieTitle,
      averageRating: rating,
      numberOfReviews: 1,
    });
    res
      .status(201)
      .json({ message: "Movie entry created and review submitted", movie });
  } else {
    // For now, we'll just update average rating and count (simple implementation)
    // In a more complex app, you'd fetch all existing reviews for this movie,
    // add the new one, then recalculate the average and count.
    // We'll properly implement a separate Review model later.
    const newTotalRating = movie.averageRating * movie.numberOfReviews + rating;
    const newNumberOfReviews = movie.numberOfReviews + 1;
    movie.averageRating = newTotalRating / newNumberOfReviews;
    movie.numberOfReviews = newNumberOfReviews;

    await movie.save();
    res
      .status(200)
      .json({ message: "Review submitted and movie entry updated", movie });
  }
});

// @desc    Get reviews for a specific movie from our DB
// @route   GET /api/movies/:tmdbId/reviews
// @access  Public
const getMovieReviews = asyncHandler(async (req, res) => {
  // In this basic setup, we're just checking if a movie has been reviewed in our DB.
  // In Day 7/8, we'll implement a full Review model and return actual reviews.
  const movie = await Movie.findOne({ tmdbId: req.params.tmdbId });

  if (movie) {
    res.json({
      tmdbId: movie.tmdbId,
      title: movie.title,
      averageRating: movie.averageRating,
      numberOfReviews: movie.numberOfReviews,
      // Actual reviews will be fetched from a Review model here
      reviews: [], // Placeholder for now
    });
  } else {
    res.status(404);
    throw new Error("No reviews found for this movie in our database yet.");
  }
});

module.exports = {
  searchMovies,
  getMovieExternalDetails,
  getReviewedMovies,
  getLocalMovieEntry,
  submitReviewAndRating,
  getMovieReviews,
};
