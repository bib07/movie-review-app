

// client/src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const HomePage = () => {
  const { user, token } = useContext(AuthContext);

  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [reviewedMovies, setReviewedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortByPopular, setSortByPopular] = useState("popularity.desc");
  const [sortByNowPlaying, setSortByNowPlaying] = useState("popularity.desc");

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");

  const [userWatchedMovieIds, setUserWatchedMovieIds] = useState([]);
  const [userWatchlistMovieIds, setUserWatchlistMovieIds] = useState([]);

  const fetchMoviesByGenre = useCallback(
    async (genreId) => {
      try {
        setLoading(true); // Ensure loading is true at the start of every fetch
        setError(null);

        let popularParams = { sortBy: sortByPopular };
        let nowPlayingParams = { sortBy: sortByNowPlaying };

        if (genreId) {
          popularParams = { ...popularParams, with_genres: genreId };
          nowPlayingParams = { ...nowPlayingParams, with_genres: genreId };
        }

        const [popularResponse, nowPlayingResponse, localMoviesResponse] =
          await Promise.all([
            axios.get("/api/movies/tmdb/popular", { params: popularParams }),
            axios.get("/api/movies/tmdb/now_playing", {
              params: nowPlayingParams,
            }),
            axios.get("/api/movies/reviewed"), // Fetch reviewed movies in parallel
          ]);

        const popularData = popularResponse.data;
        if (popularData && popularData.results) {
          setPopularMovies(popularData.results);
        } else {
          console.error(
            "Popular Movies data missing results array:",
            popularData
          );
          setPopularMovies([]);
        }

        const nowPlayingData = nowPlayingResponse.data;
        if (nowPlayingData && nowPlayingData.results) {
          setNowPlayingMovies(nowPlayingData.results);
        } else {
          console.error(
            "Now Playing Movies data missing results array:",
            nowPlayingData
          );
          setNowPlayingMovies([]);
        }

        // Process reviewed movies
        const moviesWithDetails = await Promise.all(
          localMoviesResponse.data.map(async (localMovie) => {
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
        setReviewedMovies(moviesWithDetails);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch movie lists");
        console.error("Error fetching home page movie lists:", err);
      } finally {
        setLoading(false);
      }
    },
    [sortByPopular, sortByNowPlaying]
  );

  const fetchUserLists = useCallback(async () => {
    if (!user || !token) {
      setUserWatchedMovieIds([]);
      setUserWatchlistMovieIds([]);
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const { data } = await axios.get("/api/users/lists", config);
      setUserWatchedMovieIds(data.watchedMovies.map((m) => m.id));
      setUserWatchlistMovieIds(data.watchlistMovies.map((m) => m.id));
    } catch (err) {
      console.error("Error fetching user movie lists:", err);
    }
  }, [user, token]);

  const handleMovieCardListUpdate = useCallback(
    (updatedWatchedMovies, updatedWatchlistMovies) => {
      setUserWatchedMovieIds(updatedWatchedMovies.map((m) => m.id));
      setUserWatchlistMovieIds(updatedWatchlistMovies.map((m) => m.id));
    },
    []
  );

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          `${TMDB_API_BASE_URL}/genre/movie/list`,
          {
            params: {
              api_key: TMDB_API_KEY,
              language: "en-US",
            },
          }
        );
        setGenres(response.data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMoviesByGenre(selectedGenre);
    fetchUserLists();
  }, [fetchMoviesByGenre, fetchUserLists, selectedGenre]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4 mx-auto"></div>
          <p className="text-xl font-semibold">Loading cinematic wonders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900 text-red-400">
        <p className="text-xl font-bold">Error: {error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      {/* Hero Section */}
      <div
        className="relative h-96 flex items-center justify-center text-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url('https://source.unsplash.com/random/1600x900/?movie-theater,popcorn,film')`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>{" "}
        {/* Dark overlay */}
        <div className="relative z-10 p-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Dive into the World of Cinema
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-6">
            Discover, review, and connect with movies you love.
          </p>
          <Link
            to="/search"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Start Exploring
          </Link>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Global Genre Dropdown (Styling Enhanced) */}
        <div className="flex justify-center mb-12 mt-12">
          {" "}
          {/* Centered with more vertical margin */}
          <label htmlFor="genre-select" className="sr-only">
            Select Genre
          </label>{" "}
          {/* Accessibility */}
          <select
            id="genre-select"
            className="p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer text-lg font-medium"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Popular Movies Section */}
        <section className="mb-16 bg-gray-800 p-8 rounded-xl shadow-2xl">
          {" "}
          {/* Card-like section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
            {" "}
            {/* More gap */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-400">
              {" "}
              {/* Accent color for heading */}
              Popular Movies
            </h2>
            <select
              className="p-3 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
              value={sortByPopular}
              onChange={(e) => {
                setSortByPopular(e.target.value);
              }}
            >
              <option value="popularity.desc">Popularity Descending</option>
              <option value="popularity.asc">Popularity Ascending</option>
              <option value="vote_average.desc">Rating Descending</option>
              <option value="vote_average.asc">Rating Ascending</option>
              <option value="release_date.desc">Release Date Descending</option>
              <option value="release_date.asc">Release Date Ascending</option>
            </select>
          </div>
          {popularMovies.length === 0 && !loading ? (
            <p className="text-gray-400 text-center text-lg">
              No popular movies available for the selected criteria.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-center">
              {" "}
              {/* Larger gap */}
              {popularMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  userWatchedMovies={userWatchedMovieIds}
                  userWatchlistMovies={userWatchlistMovieIds}
                  onListUpdate={handleMovieCardListUpdate}
                />
              ))}
            </div>
          )}
        </section>

        {/* Now Playing Movies Section */}
        <section className="mb-16 bg-gray-800 p-8 rounded-xl shadow-2xl">
          {" "}
          {/* Consistent card-like section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-400">
              Now Playing Movies
            </h2>
            <select
              className="p-3 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
              value={sortByNowPlaying}
              onChange={(e) => {
                setSortByNowPlaying(e.target.value);
              }}
            >
              <option value="popularity.desc">Popularity Descending</option>
              <option value="popularity.asc">Popularity Ascending</option>
              <option value="vote_average.desc">Rating Descending</option>
              <option value="vote_average.asc">Rating Ascending</option>
              <option value="release_date.desc">Release Date Descending</option>
              <option value="release_date.asc">Release Date Ascending</option>
            </select>
          </div>
          {nowPlayingMovies.length === 0 && !loading ? (
            <p className="text-gray-400 text-center text-lg">
              No now playing movies available for the selected criteria.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-center">
              {nowPlayingMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  userWatchedMovies={userWatchedMovieIds}
                  userWatchlistMovies={userWatchlistMovieIds}
                  onListUpdate={handleMovieCardListUpdate}
                />
              ))}
            </div>
          )}
        </section>

        {/* Movies Reviewed by Our Community Section */}
        <section className="mb-16 bg-gray-800 p-8 rounded-xl shadow-2xl">
          {" "}
          {/* Consistent card-like section */}
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-indigo-400 text-center">
            Movies Reviewed by Our Community
          </h2>
          {reviewedMovies.length === 0 && !loading ? (
            <p className="text-gray-400 text-center text-lg">
              No movies have been reviewed yet in our database. Be the first to
              add one via the{" "}
              <Link
                to="/search"
                className="text-indigo-400 hover:underline hover:text-indigo-300 transition-colors duration-200"
              >
                Search
              </Link>{" "}
              page!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-center">
              {reviewedMovies.map((movie) => (
                <MovieCard
                  key={movie.id || movie.tmdbId}
                  movie={movie}
                  userWatchedMovies={userWatchedMovieIds}
                  userWatchlistMovies={userWatchlistMovieIds}
                  onListUpdate={handleMovieCardListUpdate}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
