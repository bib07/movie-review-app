
// client/src/pages/MovieDetailPage.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaStar } from "react-icons/fa"; // Import star icon

const MovieDetailPage = () => {
  const { tmdbId } = useParams();
  const { user, token } = useContext(AuthContext);

  const [movieDetails, setMovieDetails] = useState(null);
  const [localMovieData, setLocalMovieData] = useState({
    averageRating: 0,
    numberOfReviews: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const API_IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const API_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
  const YOUTUBE_BASE_URL = "https://www.youtube.com/watch?v=";

  const fetchMovieAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: tmdbData } = await axios.get(`/api/movies/tmdb/${tmdbId}`);
      setMovieDetails(tmdbData);

      const { data: localData } = await axios.get(
        `/api/movies/${tmdbId}/reviews`
      );
      setReviews(localData.reviews);
      setLocalMovieData({
        averageRating: localData.averageRating,
        numberOfReviews: localData.numberOfReviews,
      });

      if (user) {
        const currentUserReview = localData.reviews.find(
          (review) => review.userId === user._id
        );
        if (currentUserReview) {
          setUserReview(currentUserReview);
          setReviewRating(currentUserReview.rating);
          setReviewText(currentUserReview.reviewText);
          setIsEditing(true);
        } else {
          setUserReview(null);
          setReviewRating(0);
          setReviewText("");
          setIsEditing(false);
        }
      } else {
        setUserReview(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch movie details or reviews."
      );
      console.error("Error fetching movie details/reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieAndReviews();
  }, [tmdbId, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    if (!user || !token) {
      setReviewMessage("Please log in to submit a review.");
      return;
    }
    if (reviewRating === 0) {
      setReviewMessage("Please provide a rating.");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        rating: reviewRating,
        reviewText,
        movieTitle: movieDetails.title,
      };

      const response = isEditing
        ? await axios.put(`/api/movies/reviews/${userReview._id}`, payload, config)
        : await axios.post(`/api/movies/${tmdbId}/reviews`, payload, config);

      setReviewMessage(response.data.message);
      fetchMovieAndReviews();
    } catch (err) {
      setReviewMessage(err.response?.data?.message || "Failed to submit review.");
      console.error("Error submitting review:", err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `/api/movies/reviews/${reviewId}`,
        config
      );
      setReviewMessage(response.data.message);
      fetchMovieAndReviews();
    } catch (err) {
      setReviewMessage(err.response?.data?.message || "Failed to delete review.");
      console.error("Error deleting review:", err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-2xl font-semibold">Loading movie details...</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
        <p className="text-2xl font-semibold">Error: {error}</p>
      </div>
    );
  if (!movieDetails)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-500">
        <p className="text-2xl font-semibold">Movie details not found.</p>
      </div>
    );

  const genres = movieDetails.genres?.map((g) => g.name).join(", ");
  const directors = movieDetails.credits?.crew
    ?.filter((member) => member.job === "Director")
    ?.map((d) => d.name)
    .join(", ");
  const cast = movieDetails.credits?.cast?.slice(0, 5).map((c) => c.name).join(", ");

  return (
    <div className="relative min-h-screen bg-gray-900 text-white pb-12">
      {/* Backdrop Image */}
      {movieDetails.backdrop_path && (
        <div
          className="absolute top-0 left-0 w-full h-[60vh] md:h-[70vh] object-cover object-center brightness-50 z-0"
          style={{
            backgroundImage: `url(${API_BACKDROP_BASE_URL}${movieDetails.backdrop_path})`,
          }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-12 md:mt-24 bg-gray-800 bg-opacity-70 rounded-lg shadow-2xl backdrop-blur-md border border-gray-700">
        {/* Poster */}
        <div className="flex-shrink-0 w-full md:w-80 rounded-lg overflow-hidden shadow-xl">
          {movieDetails.poster_path ? (
            <img
              src={`${API_IMG_BASE_URL}${movieDetails.poster_path}`}
              alt={movieDetails.title}
              className="w-full h-auto block rounded-lg"
              style={{ aspectRatio: "2/3" }}
            />
          ) : (
            <div
              className="w-full h-96 bg-gray-700 flex items-center justify-center text-gray-400 text-2xl font-semibold rounded-lg"
              style={{ aspectRatio: "2/3" }}
            >
              No Poster Available
            </div>
          )}
        </div>

        {/* Movie Details */}
        <div className="flex-grow text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {movieDetails.title} ({movieDetails.release_date?.substring(0, 4)})
          </h1>
          <p className="text-lg leading-relaxed mb-6">{movieDetails.overview}</p>
          <div className="space-y-2">
            <p>
              <strong className="font-semibold text-gray-300">Genres:</strong>{" "}
              {genres || "N/A"}
            </p>
            <p>
              <strong className="font-semibold text-gray-300">
                Director(s):
              </strong>{" "}
              {directors || "N/A"}
            </p>
            <p>
              <strong className="font-semibold text-gray-300">Cast:</strong>{" "}
              {cast || "N/A"}
            </p>
            <p>
              <strong className="font-semibold text-gray-300">
                TMDB Rating:
              </strong>{" "}
              {movieDetails.vote_average?.toFixed(1)} / 10 (
              {movieDetails.vote_count} votes)
            </p>
            <p>
              <strong className="font-semibold text-gray-300">Runtime:</strong>{" "}
              {movieDetails.runtime} minutes
            </p>
          </div>

          {/* Community Rating */}
          {localMovieData.numberOfReviews > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-600">
              <h3 className="text-2xl font-bold mb-2">
                Our Community's Rating:
              </h3>
              <p className="text-lg">
                Average:{" "}
                <span className="font-bold text-indigo-400">
                  {localMovieData.averageRating?.toFixed(1)}
                </span>{" "}
                / 5
              </p>
              <p className="text-lg">
                Total Reviews:{" "}
                <span className="font-bold text-indigo-400">
                  {localMovieData.numberOfReviews}
                </span>
              </p>
            </div>
          )}
          {localMovieData.numberOfReviews === 0 && (
            <p className="italic text-gray-400 mt-4">
              No reviews from our community yet. Be the first to add one!
            </p>
          )}

          {/* Review Form */}
          <div className="mt-12 pt-6 border-t border-gray-600">
            <h3 className="text-3xl font-bold mb-4">
              {isEditing ? "Edit Your Review" : "Submit Your Review"}
            </h3>
            {reviewMessage && (
              <p
                className={`mb-4 ${
                  reviewMessage.includes("successfully")
                    ? "text-green-400"
                    : "text-red-400"
                } font-medium`}
              >
                {reviewMessage}
              </p>
            )}
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="rating"
                  className="block text-lg font-medium mb-2 text-gray-300"
                >
                  Rating (0-5):
                </label>
                <input
                  type="number"
                  id="rating"
                  min="0"
                  max="5"
                  step="0.5"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseFloat(e.target.value))}
                  required
                  className="p-3 text-lg border border-gray-700 rounded-lg w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="reviewText"
                  className="block text-lg font-medium mb-2 text-gray-300"
                >
                  Review Text:
                </label>
                <textarea
                  id="reviewText"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="6"
                  placeholder="Write your review here..."
                  className="p-3 text-lg border border-gray-700 rounded-lg w-full resize-y bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-8 py-4 text-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!user}
              >
                {user ? (isEditing ? "Update Review" : "Submit Review") : "Login to Review"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUserReview(null);
                    setReviewRating(0);
                    setReviewText("");
                    setReviewMessage("");
                  }}
                  className="px-8 py-4 text-xl font-semibold bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-300 mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Display Individual Reviews */}
          <div className="mt-12 pt-6 border-t border-gray-600">
            <h3 className="text-3xl font-bold mb-6">
              All Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-gray-400 italic">
                No individual reviews yet. Be the first to add one!
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-semibold text-indigo-400">
                        {review.username}
                      </p>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        {[...Array(review.rating)].map((_, index) => (
                          <FaStar key={index} />
                        ))}
                        {[...Array(5 - review.rating)].map((_, index) => (
                          <FaStar key={index} className="text-gray-500" />
                        ))}
                        <span className="text-white ml-2">({review.rating} / 5)</span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-3">
                      {review.reviewText || "No review text provided."}
                    </p>
                    <p className="text-sm text-gray-500 italic">
                      Reviewed on:{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    {user && user._id === review.userId && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setUserReview(review);
                            setReviewRating(review.rating);
                            setReviewText(review.reviewText);
                            setIsEditing(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;