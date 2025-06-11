// client/src/pages/HomePage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [reviewedMovies, setReviewedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_IMG_BASE_URL = "https://image.tmdb.org/t/p/w300";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Popular Movies
        const popularResponse = await axios.get("/api/movies/tmdb/popular");
        const popularData = popularResponse.data;
        console.log("Popular Movies API Response Data:", popularData);
        if (popularData && popularData.results) {
          setPopularMovies(popularData.results.slice(0, 10));
        } else {
          console.error(
            "Popular Movies data missing results array:",
            popularData
          );
          setPopularMovies([]);
        }

        // Fetch Now Playing Movies
        const nowPlayingResponse = await axios.get(
          "/api/movies/tmdb/now_playing"
        );
        const nowPlayingData = nowPlayingResponse.data;
        console.log("Now Playing Movies API Response Data:", nowPlayingData);
        if (nowPlayingData && nowPlayingData.results) {
          setNowPlayingMovies(nowPlayingData.results.slice(0, 10));
        } else {
          console.error(
            "Now Playing Movies data missing results array:",
            nowPlayingData
          );
          setNowPlayingMovies([]);
        }

        // Fetch Reviewed Movies (from our database)
        const { data: localMovies } = await axios.get("/api/movies/reviewed");
        const moviesWithDetails = await Promise.all(
          // <-- This variable was correctly defined here
          localMovies.map(async (localMovie) => {
            try {
              const { data: tmdbDetails } = await axios.get(
                `/api/movies/tmdb/${localMovie.tmdbId}`
              );
              return { ...localMovie, ...tmdbDetails };
            } catch (tmdbError) {
              console.error(
                `Failed to fetch TMDB details for ID ${localMovie.tmdbId} for reviewed list:`,
                tmdbError.response?.data || tmdbError.message
              );
              return { ...localMovie, tmdbError: true };
            }
          })
        );
        setReviewedMovies(moviesWithDetails); // <-- And used here
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch movie lists");
        console.error("Error fetching home page movie lists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const renderMovieSection = (title, movies) => (
    <section className="mb-12">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 text-center">
        {title}
      </h2>
      {movies.length === 0 && !loading && (
        <p className="text-gray-600 text-center">No movies available.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
        {movies.map((movie) => (
          <div
            key={movie.id || movie.tmdbId}
            className="bg-white rounded-lg shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full"
          >
            <Link
              to={`/movie/${movie.id || movie.tmdbId}`}
              className="block h-full flex flex-col justify-between text-gray-800 no-underline"
            >
              {movie.poster_path ? (
                <img
                  src={`${API_IMG_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-80 md:h-96 object-cover border-b border-gray-200"
                />
              ) : (
                <div className="w-full h-80 md:h-96 bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold border-b border-gray-200">
                  No Poster Available
                </div>
              )}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <h3 className="text-lg md:text-xl font-semibold mb-1 leading-tight">
                  {movie.title}
                </h3>
                {movie.release_date && (
                  <p className="text-sm text-gray-600">
                    ({movie.release_date.substring(0, 4)})
                  </p>
                )}
                {movie.averageRating && movie.numberOfReviews && (
                  <p className="text-sm text-gray-700 mt-2">
                    Rating:{" "}
                    <span className="font-bold">
                      {movie.averageRating.toFixed(1)}
                    </span>{" "}
                    / 5 ({movie.numberOfReviews} reviews)
                  </p>
                )}
                {movie.tmdbError && (
                  <p className="text-orange-500 text-sm mt-2">
                    TMDB data missing
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );

  if (loading)
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-xl text-gray-700">
        Loading movies...
      </div>
    );
  if (error)
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-xl text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-gray-900">
        Welcome to ReviewMov
      </h1>

      {renderMovieSection("Popular Movies", popularMovies)}
      {renderMovieSection("Now Playing Movies", nowPlayingMovies)}
      {renderMovieSection("Movies Reviewed by Our Community", reviewedMovies)}

      {reviewedMovies.length === 0 && !loading && (
        <p className="text-gray-600 text-center mt-8 text-lg">
          No movies have been reviewed yet in our database. Be the first to add
          one via the{" "}
          <Link to="/search" className="text-blue-600 hover:underline">
            Search
          </Link>{" "}
          page!
        </p>
      )}
    </div>
  );
};

export default HomePage;
