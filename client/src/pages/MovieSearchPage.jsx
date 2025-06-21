


// client/src/pages/MovieSearchPage.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

// TMDB API constants (should ideally be centralized if used across many components)
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fullSearchResults, setFullSearchResults] = useState([]);
  const [loadingFullSearch, setLoadingFullSearch] = useState(false);
  const [fullSearchError, setFullSearchError] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const fetchFullSearchResults = useCallback(
    async (query) => {
      if (!query) {
        setFullSearchResults([]);
        return;
      }

      setLoadingFullSearch(true);
      setFullSearchError(null);
      setSuggestions([]); // Clear suggestions when full search is initiated
      setShowSuggestions(false); // Hide suggestions

      try {
        const response = await axios.get(`${TMDB_API_BASE_URL}/search/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            query: query,
            include_adult: false,
          },
        });
        setFullSearchResults(response.data.results);
      } catch (error) {
        console.error("Error fetching full movie search results:", error);
        setFullSearchError(
          error.response?.data?.status_message ||
            "Failed to fetch search results."
        );
        setFullSearchResults([]);
      } finally {
        setLoadingFullSearch(false);
      }
    },
    [TMDB_API_KEY]
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("query");
    if (initialQuery) {
      setSearchTerm(initialQuery);
      fetchFullSearchResults(initialQuery);
    }
  }, [location.search, fetchFullSearchResults]);

  const fetchSuggestions = useCallback(
    async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        setLoadingSuggestions(false);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      setShowSuggestions(true);
      try {
        const response = await axios.get(`${TMDB_API_BASE_URL}/search/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            query: query,
            include_adult: false,
          },
        });
        const filteredSuggestions = response.data.results.slice(0, 7);
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error("Error fetching movie suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [TMDB_API_KEY]
  );

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchSuggestions(debouncedSearchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, fetchSuggestions]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (item) => {
    navigate(`/movie/${item.id}`);
    setSearchTerm(""); // Clear search term after navigation
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchInputFocus = () => {
    if (searchTerm.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay hiding suggestions to allow click on a suggestion
    setTimeout(() => setShowSuggestions(false), 100);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchFullSearchResults(searchTerm.trim());
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`, {
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8"> {/* Darker background, white text */}
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-indigo-400 drop-shadow-md"> {/* Larger, accent color heading */}
          Find Your Next Favorite Movie
        </h2>

        <form
          onSubmit={handleSearchSubmit}
          className="relative flex justify-center mb-12 gap-4"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
            placeholder="Search movie titles, directors, actors..." // More engaging placeholder
            className="p-4 text-xl border-2 border-gray-700 rounded-full w-full max-w-lg bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 shadow-xl" // Enhanced input style
          />
          <button
            type="submit"
            className="px-8 py-3 text-lg font-bold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed" // Accent button style
            disabled={loadingSuggestions || loadingFullSearch || !searchTerm.trim()} // Disable if no search term
          >
            {loadingFullSearch ? "Searching..." : "Search"}
          </button>

          {loadingSuggestions && searchTerm.length >= 2 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pr-3">
              <svg
                className="animate-spin h-6 w-6 text-indigo-400" // Accent color spinner
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 top-full left-1/2 -translate-x-1/2 w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg mt-2 shadow-2xl max-h-80 overflow-y-auto text-left animate-fade-in"> {/* Darker suggestions */}
              {suggestions.map((item) => (
                <li
                  key={`movie-suggestion-${item.id}`}
                  onClick={() => handleSuggestionClick(item)}
                  className="p-3 hover:bg-gray-700 cursor-pointer flex items-center transition-colors duration-200 border-b border-gray-700 last:border-b-0" // Darker hover, border for separation
                >
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={item.title}
                      className="w-12 h-18 object-cover rounded mr-4 shadow-md" // Larger image, shadow
                    />
                  ) : (
                    <div className="w-12 h-18 bg-gray-700 flex items-center justify-center rounded mr-4 text-gray-400 text-xs text-center border border-gray-600">
                      No Image
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-indigo-300 text-lg"> {/* Accent color for title */}
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      Movie ({item.release_date?.substring(0, 4) || "N/A"})
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showSuggestions &&
            searchTerm.length >= 2 &&
            !loadingSuggestions &&
            suggestions.length === 0 && (
              <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg mt-2 shadow-2xl p-3 text-gray-400 text-left animate-fade-in">
                No suggestions found for "{searchTerm}".
              </div>
            )}
        </form>

        {fullSearchError && (
          <p className="text-red-400 mt-8 text-xl font-medium">{fullSearchError}</p>
        )}

        {loadingFullSearch ? (
          <div className="flex items-center justify-center min-h-[300px] text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4 mx-auto"></div>
              <p className="text-xl font-semibold">Searching the cinematic universe...</p>
            </div>
          </div>
        ) : fullSearchResults.length > 0 ? (
          <div className="mt-12"> {/* More spacing above results */}
            <h3 className="text-3xl md:text-4xl font-extrabold mb-8 text-indigo-400 text-center"> {/* Larger, accent heading */}
              Search Results
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 justify-center"> {/* More columns on large screens, larger gap */}
              {fullSearchResults.map((item) => (
                <div
                  key={`full-movie-${item.id}`}
                  className="bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full border border-gray-700 group" // Dark card, border, group for child hovers
                >
                  <Link
                    to={`/movie/${item.id}`}
                    className="block h-full flex flex-col justify-between text-gray-200 no-underline"
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} // Slightly larger image size for better quality
                        alt={item.title}
                        className="w-full h-auto object-cover rounded-t-xl transition-all duration-300 group-hover:opacity-80" // Rounded top, subtle hover effect
                      />
                    ) : (
                      <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-400 text-base font-semibold rounded-t-xl border-b border-gray-600">
                        No Poster
                      </div>
                    )}
                    <div className="p-4 flex-grow flex flex-col justify-between"> {/* More padding */}
                      <h3 className="text-xl font-bold mb-2 leading-tight text-indigo-300"> {/* Larger, bolder title, accent color */}
                        {item.title}
                      </h3>
                      {item.release_date && (
                        <p className="text-md text-gray-400"> {/* Slightly larger release date */}
                          ({item.release_date.substring(0, 4)})
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !loadingFullSearch &&
          searchTerm && (
            <p className="text-gray-400 text-xl mt-12"> {/* Darker text, more margin */}
              No movies found for "<span className="text-indigo-300 font-semibold">{searchTerm}</span>". Try a different search term.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default MovieSearchPage;