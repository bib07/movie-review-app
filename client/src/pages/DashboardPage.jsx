// // client/src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../context/AuthContext';
// import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

// const UserDashboardPage = () => {
//   const { user, token, logout } = useContext(AuthContext); // Get logout from context
//   const [userReviews, setUserReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate(); // Initialize useNavigate

//   useEffect(() => {
//     if (!user || !token) {
//       // If not logged in, redirect to login page
//       navigate('/login');
//       return;
//     }

//     const fetchUserReviews = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };
//         const { data } = await axios.get('/api/users/me/reviews', config);
//         setUserReviews(data);
//       } catch (err) {
//         console.error('Error fetching user reviews:', err);
//         setError('Failed to load your reviews.');
//         if (err.response && err.response.status === 401) {
//           // Token expired or invalid, log out user
//           logout();
//           navigate('/login');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserReviews();
//   }, [user, token, navigate, logout]);

//   if (loading) {
//     return (
//       <div className="container mx-auto p-4 text-center">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h2>
//         <p>Loading your reviews...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto p-4 text-center">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h2>
//         <p className="text-red-500">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg mt-8">
//       <h2 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">
//         Hello, {user?.name}! Your Reviews
//       </h2>

//       {userReviews.length === 0 ? (
//         <p className="text-center text-gray-600 text-lg">
//           You haven't submitted any reviews yet.
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {userReviews.map((review) => (
//             <div
//               key={review._id}
//               className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <h4 className="text-2xl font-bold text-blue-700">
//                   <Link
//                     to={`/movie/${review.movie?.tmdbId}`} // Link to the movie page
//                     className="hover:underline"
//                   >
//                     {review.movie?.title || 'Unknown Movie'}
//                   </Link>
//                 </h4>
//                 <span className="text-xl font-extrabold text-yellow-600">
//                   {review.rating} / 5
//                 </span>
//               </div>
//               <p className="text-gray-700 leading-relaxed mb-4">
//                 {review.reviewText || 'No review text provided.'}
//               </p>
//               <p className="text-sm text-gray-500 italic">
//                 Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
//               </p>
//               {/* Optional: Add Edit/Delete buttons if you want users to manage reviews directly from here */}
//               {/* You'd need to re-implement/adapt the edit/delete handlers from MovieDetailPage */}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserDashboardPage;

// client/src/pages/UserDashboardPage.jsx (Update this file)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(6); // You can adjust this number
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);

  const navigate = useNavigate();

  // Use useCallback to memoize the fetch function to prevent unnecessary re-renders
  const fetchUserReviews = useCallback(async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { // Send pagination parameters
          page: currentPage,
          limit: reviewsPerPage,
          // You can add sortBy and order here if you want sorting controls
        },
      };
      const { data } = await axios.get('/api/users/me/reviews', config);
      setUserReviews(data.reviews);
      setTotalPages(data.totalPages);
      setTotalReviewsCount(data.totalReviews);
      setCurrentPage(data.page); // Ensure currentPage is in sync with backend response
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load your reviews.');
      if (err.response && err.response.status === 401) {
        logout(); // Log out user on auth error
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [user, token, navigate, logout, currentPage, reviewsPerPage]); // Dependencies for useCallback

  useEffect(() => {
    fetchUserReviews();
  }, [fetchUserReviews]); // Re-run effect when fetchUserReviews changes (due to currentPage, etc.)

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h2>
        <p className="text-lg">Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h2>
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-4xl font-extrabold text-blue-800 mb-4 text-center">
        Hello, {user?.name}!
      </h2>
      <p className="text-center text-gray-600 text-lg mb-8">
        You have submitted {totalReviewsCount} review(s).
      </p>

      {userReviews.length === 0 && totalReviewsCount === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          You haven't submitted any reviews yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userReviews.map((review) => (
              <div
                key={review._id}
                className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-2xl font-bold text-blue-700 flex items-center">
                    {review.movie?.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${review.movie.poster_path}`}
                        alt={review.movie.title}
                        className="w-12 h-auto rounded mr-3"
                      />
                    )}
                    <Link
                      to={`/movie/${review.movie?.tmdbId}`}
                      className="hover:underline"
                    >
                      {review.movie?.title || 'Unknown Movie'}
                    </Link>
                  </h4>
                  <span className="text-xl font-extrabold text-yellow-600">
                    {review.rating} / 5
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {review.reviewText || 'No review text provided.'}
                </p>
                <p className="text-sm text-gray-500 italic">
                  Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map((page) => (
                <button
                  key={page + 1}
                  onClick={() => handlePageChange(page + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === page + 1
                      ? 'bg-blue-800 text-white'
                      : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                  } transition duration-300`}
                >
                  {page + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;