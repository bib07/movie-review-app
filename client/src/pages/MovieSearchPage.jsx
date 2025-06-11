// client/src/pages/MovieSearchPage.js
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MovieSearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const { data } = await axios.get(`/api/movies/search?query=${query}`);
      setResults(data.results);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search movies.");
      console.error("Error searching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-center">
      <h2 className="text-4xl font-extrabold mb-8 text-gray-800">
        Search for Movies
      </h2>
      <form onSubmit={handleSearch} className="flex justify-center mb-8 gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movie title..."
          className="p-3 text-lg border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-center">
        {results.length > 0
          ? results.map((movie) => (
              <div
                key={movie.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full"
              >
                <Link
                  to={`/movie/${movie.id}`}
                  className="block h-full flex flex-col justify-between text-gray-800 no-underline"
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto object-cover border-b border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gray-300 flex items-center justify-center text-gray-600 text-base font-semibold border-b border-gray-200">
                      No Poster
                    </div>
                  )}
                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <h3 className="text-lg font-semibold mb-1 leading-tight">
                      {movie.title}
                    </h3>
                    {movie.release_date && (
                      <p className="text-sm text-gray-600">
                        ({movie.release_date.substring(0, 4)})
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))
          : !loading &&
            query && (
              <p className="text-gray-600 mt-4">
                No results found for "{query}".
              </p>
            )}
      </div>
    </div>
  );
};

export default MovieSearchPage;
