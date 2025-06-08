// server/models/Movie.js
const mongoose = require('mongoose');

const movieSchema = mongoose.Schema(
  {
    tmdbId: { // The unique ID for this movie from The Movie Database
      type: String,
      required: true,
      unique: true, // Each TMDB movie should have only one entry in our DB
    },
    title: { // Store a local copy of the title for easier querying/display
      type: String,
      required: true,
    },
    // These fields will aggregate ratings and review counts from *our users*
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;