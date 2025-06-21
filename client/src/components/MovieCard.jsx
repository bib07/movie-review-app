

// client/src/components/MovieCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
// Import icons (example: from react-icons, make sure to install if not already: npm install react-icons)
import { FaEye, FaRegEye, FaBookmark, FaRegBookmark } from "react-icons/fa";

const API_IMG_BASE_URL = "https://image.tmdb.org/t/p/w300";

const MovieCard = ({
  movie,
  userWatchedMovies,
  userWatchlistMovies,
  onListUpdate,
}) => {
  const { user, token } = useContext(AuthContext);

  const isWatched = userWatchedMovies.includes(movie.id);
  const isOnWatchlist = userWatchlistMovies.includes(movie.id);

  const handleAddToList = async (listType) => {
    if (!user || !token) {
      alert("You must be logged in to add movies to lists."); // Consider a more elegant notification system later
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const payload = { tmdbId: movie.id };
      const { data } = await axios.post(
        `/api/users/lists/${listType}`,
        payload,
        config
      );

      if (onListUpdate) {
        onListUpdate(data.watchedMovies, data.watchlistMovies);
      }
    } catch (err) {
      console.error(`Error adding to ${listType}:`, err);
      alert(
        `Failed to add to ${listType}: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleRemoveFromList = async (listType) => {
    if (!user || !token) {
      alert("You must be logged in to remove movies from lists."); // Consider a more elegant notification system later
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const { data } = await axios.delete(
        `/api/users/lists/${listType}/${movie.id}`,
        config
      );

      if (onListUpdate) {
        onListUpdate(data.watchedMovies, data.watchlistMovies);
      }
    } catch (err) {
      console.error(`Error removing from ${listType}:`, err);
      alert(
        `Failed to remove from ${listType}: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  return (
    // Outer Container: Dark background, rounded, elevated shadow, hover effects
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full border border-gray-700 group">
      <Link to={`/movie/${movie.id}`} className="block relative">
        {movie.poster_path ? (
          <img
            src={`${API_IMG_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
            // Ensure consistent image height/aspect ratio for all cards in a grid
            className="w-full h-auto object-cover rounded-t-xl transition-all duration-300 group-hover:opacity-80"
            style={{ aspectRatio: "2/3" }} // Common movie poster aspect ratio
          />
        ) : (
          <div
            className="w-full bg-gray-700 flex items-center justify-center text-gray-400 text-lg font-semibold rounded-t-xl border-b border-gray-600"
            style={{ aspectRatio: "2/3" }} // Maintain aspect ratio for placeholder
          >
            No Poster
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col justify-between flex-grow text-white">
        {" "}
        {/* Text color set to white */}
        <Link
          to={`/movie/${movie.id}`}
          className="no-underline text-indigo-300 hover:text-indigo-400 transition-colors duration-200" // Accent color for title link
        >
          <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
            {" "}
            {/* Larger, bolder title */}
            {movie.title}
          </h3>
        </Link>
        {movie.release_date && (
          <p className="text-sm text-gray-400">
            {" "}
            {/* Muted text for date */}({movie.release_date.substring(0, 4)})
          </p>
        )}
        {movie.vote_average > 0 && ( // Only show rating if available and > 0
          <p className="text-md text-gray-300 mt-2 flex items-center">
            {" "}
            {/* Slightly larger rating text */}
            <span className="text-yellow-400 mr-1">⭐</span>{" "}
            {/* Star icon for rating */}
            TMDB Rating:{" "}
            <span className="font-bold text-lg ml-1">
              {movie.vote_average.toFixed(1)}
            </span>{" "}
            <span className="text-sm text-gray-400">/ 10</span>
          </p>
        )}
        {/* Action Buttons */}
        {user && ( // Only show if user is logged in
          <div className="mt-4 space-y-3">
            {" "}
            {/* Increased vertical spacing for buttons */}
            {!isWatched ? (
              <button
                onClick={() => handleAddToList("watched")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-[1.02]" // Green for watched, slight scale on hover
              >
                <FaRegEye className="text-lg" />
                <span>Mark as Watched</span>
              </button>
            ) : (
              <button
                onClick={() => handleRemoveFromList("watched")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-[1.02]" // Muted grey when watched
              >
                <FaEye className="text-lg" />
                <span>Watched (Remove)</span>
              </button>
            )}
            {!isOnWatchlist ? (
              <button
                onClick={() => handleAddToList("watchlist")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-[1.02]" // Indigo for watchlist
              >
                <FaRegBookmark className="text-lg" />
                <span>Add to Watchlist</span>
              </button>
            ) : (
              <button
                onClick={() => handleRemoveFromList("watchlist")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-[1.02]" // Muted grey when on watchlist
              >
                <FaBookmark className="text-lg" />
                <span>On Watchlist (Remove)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
