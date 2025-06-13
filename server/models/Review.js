// server/models/Review.js
const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    tmdbId: {
      type: String, // TMDB ID of the movie
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    username: {
      type: String, // Store username directly for display ease, could also populate from User
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewText: {
      type: String,
      required: false, // Review text is optional, but rating is required
      default: "",
    },
     movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie', // This links review to the Movie model
      required: true, // A review must belong to a movie
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
