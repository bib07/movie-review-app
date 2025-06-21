

// // client/src/pages/UserDashboardPage.jsx (Updated file)
// import React, { useState, useEffect, useContext, useCallback } from "react";
// import axios from "axios";
// import { AuthContext } from "../context/AuthContext";
// import { Link, useNavigate } from "react-router-dom";

// // Define the TMDB image base URL for movie posters
// const API_IMG_BASE_URL = "https://image.tmdb.org/t/p/w300"; // For dashboard/profile, w300 or w185 is good

// const DashboardPage = () => {
//   const { user, token, logout } = useContext(AuthContext);
//   const [userReviews, setUserReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Pagination state for reviews
//   const [currentPage, setCurrentPage] = useState(1);
//   const [reviewsPerPage] = useState(6); // You can adjust this number
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalReviewsCount, setTotalReviewsCount] = useState(0);

//   // --- NEW STATE FOR WATCHED AND WATCHLIST MOVIES ---
//   const [watchedMovies, setWatchedMovies] = useState([]);
//   const [watchlistMovies, setWatchlistMovies] = useState([]);
//   // --- END NEW STATE ---

//   const navigate = useNavigate();

//   // Use useCallback to memoize the fetch function to prevent unnecessary re-renders
//   // This function will now fetch ALL dashboard data: reviews, watched, and watchlist
//   const fetchDashboardData = useCallback(async () => {
//     if (!user || !token) {
//       navigate("/login");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       };

//       // --- FETCH USER REVIEWS (Existing Logic) ---
//       const { data: reviewData } = await axios.get("/api/users/me/reviews", {
//         ...config,
//         params: {
//           page: currentPage,
//           limit: reviewsPerPage,
//         },
//       });
//       setUserReviews(reviewData.reviews);
//       setTotalPages(reviewData.totalPages);
//       setTotalReviewsCount(reviewData.totalReviews);
//       setCurrentPage(reviewData.page); // Ensure currentPage is in sync with backend response

//       // --- NEW: FETCH USER WATCHED & WATCHLIST MOVIES ---
//       const { data: listData } = await axios.get("/api/users/lists", config);
//       setWatchedMovies(listData.watchedMovies);
//       setWatchlistMovies(listData.watchlistMovies);
//       // --- END NEW FETCH ---
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//       setError("Failed to load your dashboard data.");
//       if (err.response && err.response.status === 401) {
//         logout(); // Log out user on auth error
//         navigate("/login");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [user, token, navigate, logout, currentPage, reviewsPerPage]); // Dependencies for useCallback

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]); // Re-run effect when fetchDashboardData changes (due to currentPage, etc.)

//   const handlePageChange = (page) => {
//     if (page > 0 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   // --- NEW: handleRemoveMovie (for Watched/Watchlist) ---
//   const handleRemoveMovie = async (tmdbId, listType) => {
//     if (!user || !token) {
//       alert("You must be logged in to remove movies from lists.");
//       return;
//     }

//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       };
//       await axios.delete(`/api/users/lists/${listType}/${tmdbId}`, config);

//       // Update state immediately after successful removal
//       if (listType === "watched") {
//         setWatchedMovies((prev) => prev.filter((movie) => movie.id !== tmdbId));
//       } else if (listType === "watchlist") {
//         setWatchlistMovies((prev) =>
//           prev.filter((movie) => movie.id !== tmdbId)
//         );
//       }
//       alert(`Movie removed from ${listType} successfully!`);
//     } catch (err) {
//       console.error(`Error removing movie from ${listType}:`, err);
//       alert(
//         `Failed to remove movie from ${listType}: ${
//           err.response?.data?.message || err.message
//         }`
//       );
//     }
//   };
//   // --- END NEW: handleRemoveMovie ---

//   // --- NEW: renderMovieCard Helper Function (for Watched/Watchlist) ---
//   const renderMovieCard = (movie, listType) => (
//     <div
//       key={movie.id}
//       className="bg-white rounded-lg shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full"
//     >
//       <Link
//         to={`/movie/${movie.id}`}
//         className="block h-full flex flex-col justify-between text-gray-800 no-underline"
//       >
//         {movie.poster_path ? (
//           <img
//             src={`${API_IMG_BASE_URL}${movie.poster_path}`}
//             alt={movie.title}
//             className="w-full h-80 md:h-96 object-cover border-b border-gray-200"
//           />
//         ) : (
//           <div className="w-full h-80 md:h-96 bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold border-b border-gray-200">
//             No Poster Available
//           </div>
//         )}
//         <div className="p-4 flex flex-col justify-between flex-grow">
//           <h3 className="text-lg md:text-xl font-semibold mb-1 leading-tight">
//             {movie.title}
//           </h3>
//           {movie.release_date && (
//             <p className="text-sm text-gray-600">
//               ({movie.release_date.substring(0, 4)})
//             </p>
//           )}
//           {movie.vote_average && (
//             <p className="text-sm text-gray-700 mt-2">
//               TMDB Rating:{" "}
//               <span className="font-bold">{movie.vote_average.toFixed(1)}</span>{" "}
//               / 10
//             </p>
//           )}
//         </div>
//       </Link>
//       <div className="p-4 pt-0">
//         <button
//           onClick={() => handleRemoveMovie(movie.id, listType)}
//           className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
//         >
//           Remove from {listType === "watched" ? "Watched" : "Watchlist"}
//         </button>
//       </div>
//     </div>
//   );
//   // --- END NEW: renderMovieCard ---

//   if (loading) {
//     return (
//       <div className="container mx-auto p-8 text-center mt-8">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">
//           Your Dashboard
//         </h2>
//         <p className="text-lg">Loading your dashboard data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto p-8 text-center mt-8">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">
//           Your Dashboard
//         </h2>
//         <p className="text-red-500 text-lg">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg mt-8">
//       <h2 className="text-4xl font-extrabold text-blue-800 mb-4 text-center">
//         Hello, {user?.name}!
//       </h2>
//       <p className="text-center text-gray-600 text-lg mb-8">
//         Welcome to your personal dashboard.
//       </p>
//       ---
//       {/* My Reviews Section (Existing) */}
//       <section className="mb-12">
//         <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
//           My Reviews ({totalReviewsCount})
//         </h3>
//         {userReviews.length === 0 && totalReviewsCount === 0 ? (
//           <p className="text-center text-gray-600 text-lg">
//             You haven't submitted any reviews yet.
//           </p>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {userReviews.map((review) => (
//                 <div
//                   key={review._id}
//                   className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300"
//                 >
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-2xl font-bold text-blue-700 flex items-center">
//                       {review.movie?.poster_path && (
//                         <img
//                           src={`https://image.tmdb.org/t/p/w92${review.movie.poster_path}`}
//                           alt={review.movie.title}
//                           className="w-12 h-auto rounded mr-3"
//                         />
//                       )}
//                       <Link
//                         to={`/movie/${review.movie?.tmdbId}`}
//                         className="hover:underline"
//                       >
//                         {review.movie?.title || "Unknown Movie"}
//                       </Link>
//                     </h4>
//                     <span className="text-xl font-extrabold text-yellow-600">
//                       {review.rating} / 5
//                     </span>
//                   </div>
//                   <p className="text-gray-700 leading-relaxed mb-4">
//                     {review.reviewText || "No review text provided."}
//                   </p>
//                   <p className="text-sm text-gray-500 italic">
//                     Reviewed on:{" "}
//                     {new Date(review.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination Controls */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center mt-10 space-x-2">
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
//                 >
//                   Previous
//                 </button>
//                 {[...Array(totalPages).keys()].map((page) => (
//                   <button
//                     key={page + 1}
//                     onClick={() => handlePageChange(page + 1)}
//                     className={`px-4 py-2 rounded-md ${
//                       currentPage === page + 1
//                         ? "bg-blue-800 text-white"
//                         : "bg-blue-200 text-blue-800 hover:bg-blue-300"
//                     } transition duration-300`}
//                   >
//                     {page + 1}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </section>
//       ---
//       {/* NEW: Watched Movies Section */}
//       <section className="mb-12">
//         <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
//           My Watched Movies ({watchedMovies.length})
//         </h3>
//         {watchedMovies.length === 0 ? (
//           <p className="text-center text-gray-600 text-lg">
//             You haven't marked any movies as watched yet.
//           </p>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
//             {watchedMovies.map((movie) => renderMovieCard(movie, "watched"))}
//           </div>
//         )}
//       </section>
//       ---
//       {/* NEW: Watchlist Section */}
//       <section className="mb-12">
//         <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
//           My Watchlist ({watchlistMovies.length})
//         </h3>
//         {watchlistMovies.length === 0 ? (
//           <p className="text-center text-gray-600 text-lg">
//             Your watchlist is empty. Find movies to add!
//           </p>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
//             {watchlistMovies.map((movie) =>
//               renderMovieCard(movie, "watchlist")
//             )}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// };

// export default DashboardPage;


// client/src/pages/UserDashboardPage.jsx (Updated file)
import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// Define the TMDB image base URL for movie posters
const API_IMG_BASE_URL = "https://image.tmdb.org/t/p/w300"; // For dashboard/profile, w300 or w185 is good

const DashboardPage = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state for reviews
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(6); // You can adjust this number
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);

  // --- NEW STATE FOR WATCHED AND WATCHLIST MOVIES ---
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  // --- END NEW STATE ---

  const navigate = useNavigate();

  // Use useCallback to memoize the fetch function to prevent unnecessary re-renders
  // This function will now fetch ALL dashboard data: reviews, watched, and watchlist
  const fetchDashboardData = useCallback(async () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // --- FETCH USER REVIEWS (Existing Logic) ---
      const { data: reviewData } = await axios.get("/api/users/me/reviews", {
        ...config,
        params: {
          page: currentPage,
          limit: reviewsPerPage,
        },
      });
      setUserReviews(reviewData.reviews);
      setTotalPages(reviewData.totalPages);
      setTotalReviewsCount(reviewData.totalReviews);
      setCurrentPage(reviewData.page); // Ensure currentPage is in sync with backend response

      // --- NEW: FETCH USER WATCHED & WATCHLIST MOVIES ---
      const { data: listData } = await axios.get("/api/users/lists", config);
      setWatchedMovies(listData.watchedMovies);
      setWatchlistMovies(listData.watchlistMovies);
      // --- END NEW FETCH ---
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load your dashboard data.");
      if (err.response && err.response.status === 401) {
        logout(); // Log out user on auth error
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [user, token, navigate, logout, currentPage, reviewsPerPage]); // Dependencies for useCallback

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Re-run effect when fetchDashboardData changes (due to currentPage, etc.)

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- NEW: handleRemoveMovie (for Watched/Watchlist) ---
  const handleRemoveMovie = async (tmdbId, listType) => {
    if (!user || !token) {
      alert("You must be logged in to remove movies from lists.");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/users/lists/${listType}/${tmdbId}`, config);

      // Update state immediately after successful removal
      if (listType === "watched") {
        setWatchedMovies((prev) => prev.filter((movie) => movie.id !== tmdbId));
      } else if (listType === "watchlist") {
        setWatchlistMovies((prev) =>
          prev.filter((movie) => movie.id !== tmdbId)
        );
      }
      // You might want a more subtle notification than alert()
      // alert(`Movie removed from ${listType} successfully!`);
    } catch (err) {
      console.error(`Error removing movie from ${listType}:`, err);
      alert(
        `Failed to remove movie from ${listType}: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };
  // --- END NEW: handleRemoveMovie ---

  // --- NEW: renderMovieCard Helper Function (for Watched/Watchlist) ---
  const renderMovieCard = (movie, listType) => (
    <div
      key={movie.id}
      className="bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-indigo-500/30 flex flex-col h-full border border-gray-700" // Dark theme card, subtle hover effect
    >
      <Link
        to={`/movie/${movie.id}`}
        className="block h-full flex flex-col justify-between text-white no-underline" // Text white
      >
        {movie.poster_path ? (
          <img
            src={`${API_IMG_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-80 md:h-96 object-cover border-b border-gray-700" // Darker border
          />
        ) : (
          <div className="w-full h-80 md:h-96 bg-gray-700 flex items-center justify-center text-gray-400 text-lg font-semibold border-b border-gray-700">
            No Poster Available
          </div>
        )}
        <div className="p-4 flex flex-col justify-between flex-grow">
          <h3 className="text-lg md:text-xl font-semibold mb-1 leading-tight text-indigo-400"> {/* Accent color for title */}
            {movie.title}
          </h3>
          {movie.release_date && (
            <p className="text-sm text-gray-400"> {/* Muted text */}
              ({movie.release_date.substring(0, 4)})
            </p>
          )}
          {movie.vote_average && (
            <p className="text-sm text-gray-400 mt-2">
              TMDB Rating:{" "}
              <span className="font-bold text-yellow-400">{movie.vote_average.toFixed(1)}</span>{" "} {/* Yellow accent for rating */}
              / 10
            </p>
          )}
        </div>
      </Link>
      <div className="p-4 pt-0">
        <button
          onClick={() => handleRemoveMovie(movie.id, listType)}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 transform hover:scale-[1.01] shadow-md" // Darker red, rounded-lg, subtle hover
        >
          Remove from {listType === "watched" ? "Watched" : "Watchlist"}
        </button>
      </div>
    </div>
  );
  // --- END NEW: renderMovieCard ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="text-center text-white">
          <svg className="animate-spin h-10 w-10 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl">Loading your cinematic universe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4"> {/* Dark background, white text */}
      <div className="container mx-auto bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-700"> {/* Dark container, rounded, shadow, border */}
        <h2 className="text-5xl font-extrabold text-center text-indigo-400 mb-4"> {/* Accent color for main title */}
          Hello, {user?.name}!
        </h2>
        <p className="text-center text-gray-400 text-xl mb-12">
          Welcome to your personal cinematic dashboard.
        </p>

        ---
        {/* My Reviews Section */}
        <section className="mb-16"> {/* Increased bottom margin for sections */}
          <h3 className="text-4xl font-extrabold text-white mb-8 text-center">
            My Reviews <span className="text-indigo-400">({totalReviewsCount})</span>
          </h3>
          {userReviews.length === 0 && totalReviewsCount === 0 ? (
            <p className="text-center text-gray-400 text-xl">
              You haven't submitted any reviews yet.{" "}
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline">
                Explore movies to review!
              </Link>
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userReviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between" // Dark theme, larger shadow, subtle hover
                  >
                    <div className="flex items-start mb-4"> {/* Use items-start for better alignment with longer titles */}
                      {review.movie?.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${review.movie.poster_path}`}
                          alt={review.movie.title}
                          className="w-16 h-auto rounded-lg mr-4 shadow-md" // Larger image, rounded, shadow
                        />
                      )}
                      <h4 className="text-2xl font-bold text-indigo-400 flex-grow"> {/* Accent color for movie title */}
                        <Link
                          to={`/movie/${review.movie?.tmdbId}`}
                          className="hover:underline"
                        >
                          {review.movie?.title || "Unknown Movie"}
                        </Link>
                      </h4>
                      <span className="text-2xl font-extrabold text-yellow-400 ml-4"> {/* Yellow accent for rating */}
                        {review.rating} / 5
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4 flex-grow"> {/* Lighter gray for review text */}
                      {review.reviewText || "No review text provided."}
                    </p>
                    <p className="text-sm text-gray-500 italic mt-auto"> {/* Muted timestamp */}
                      Reviewed on:{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 space-x-3"> {/* Increased margin and spacing */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition duration-300 text-lg shadow-md" // Larger, accent color, rounded-lg
                  >
                    Previous
                  </button>
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => handlePageChange(page + 1)}
                      className={`px-5 py-3 rounded-lg text-lg font-semibold ${
                        currentPage === page + 1
                          ? "bg-indigo-800 text-white shadow-xl" // Darker accent for active page
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600" // Dark background, light text for inactive
                      } transition duration-300`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition duration-300 text-lg shadow-md" // Larger, accent color, rounded-lg
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        ---
        {/* Watched Movies Section */}
        <section className="mb-16">
          <h3 className="text-4xl font-extrabold text-white mb-8 text-center">
            My Watched Movies <span className="text-indigo-400">({watchedMovies.length})</span>
          </h3>
          {watchedMovies.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">
              You haven't marked any movies as watched yet.{" "}
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline">
                Start tracking your movies!
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
              {watchedMovies.map((movie) => renderMovieCard(movie, "watched"))}
            </div>
          )}
        </section>

        ---
        {/* Watchlist Section */}
        <section className="mb-16">
          <h3 className="text-4xl font-extrabold text-white mb-8 text-center">
            My Watchlist <span className="text-indigo-400">({watchlistMovies.length})</span>
          </h3>
          {watchlistMovies.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">
              Your watchlist is empty.{" "}
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline">
                Find movies to add!
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
              {watchlistMovies.map((movie) =>
                renderMovieCard(movie, "watchlist")
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;