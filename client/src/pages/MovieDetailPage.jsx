// client/src/pages/MovieDetailPage.js
// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext"; // To get user token

// const MovieDetailPage = () => {
//   const { tmdbId } = useParams();
//   const { user, token } = useContext(AuthContext); // Get user and token from context

//   // Add these console logs
//   console.log("MovieDetailPage - Current User:", user);
//   console.log("MovieDetailPage - Auth Token:", token);

//   const [movieDetails, setMovieDetails] = useState(null);
//   const [localMovieData, setLocalMovieData] = useState(null); // For average rating, num reviews
//   const [reviews, setReviews] = useState([]); // Individual reviews
//   const [userReview, setUserReview] = useState(null); // Review by the current user
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reviewRating, setReviewRating] = useState(0);
//   const [reviewText, setReviewText] = useState("");
//   const [reviewMessage, setReviewMessage] = useState("");
//   const [isEditing, setIsEditing] = useState(false); // State for editing existing review

//   const API_IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
//   const API_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
//   const YOUTUBE_BASE_URL = "https://www.youtube.com/watch?v="; // Correct YouTube base URL

//   useEffect(() => {
//     const fetchMovieDetails = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Fetch TMDB external details
//         const { data: tmdbData } = await axios.get(
//           `/api/movies/tmdb/${tmdbId}`
//         );
//         setMovieDetails(tmdbData);

//         // Fetch local movie data (reviews/ratings aggregates)
//         try {
//           const { data: localData } = await axios.get(
//             `/api/movies/${tmdbId}/reviews`
//           ); // Use /reviews endpoint for local data
//           setLocalMovieData(localData);
//         } catch (localError) {
//           // This is expected if no reviews exist yet (404 from our API)
//           setLocalMovieData(null);
//           console.log(
//             "No local reviews yet for this movie:",
//             localError.response?.data?.message
//           );
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message || "Failed to fetch movie details."
//         );
//         console.error("Error fetching movie details:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMovieDetails();
//   }, [tmdbId]); // Re-run effect if tmdbId changes

//   const handleSubmitReview = async (e) => {
//     e.preventDefault();
//     setReviewMessage("");

//     // --- ADD THESE NEW CONSOLE LOGS HERE ---
//     // console.log("handleSubmitReview - User at submission:", user);
//     // console.log("handleSubmitReview - Token at submission:", token);

//     if (!user || !token) {
//       setReviewMessage("Please log in to submit a review.");
//       return;
//     }
//     if (reviewRating === 0) {
//       setReviewMessage("Please provide a rating.");
//       return;
//     }

//     try {
//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       };

//       const { data } = await axios.post(
//         `/api/movies/${tmdbId}/reviews`,
//         {
//           rating: reviewRating,
//           reviewText,
//           movieTitle: movieDetails.title, // Send title to backend for local storage
//         },
//         config
//       );
//       setReviewMessage("Review submitted successfully!");
//       // Update local movie data after successful submission
//       setLocalMovieData(data.movie); // The backend returns the updated movie entry
//       setReviewRating(0); // Reset form
//       setReviewText("");
//     } catch (err) {
//       setReviewMessage(
//         err.response?.data?.message || "Failed to submit review."
//       );
//       console.error("Error submitting review:", err);
//     }
//   };

//   if (loading)
//     return (
//       <div className="p-8 max-w-7xl mx-auto text-center text-gray-700">
//         Loading movie details...
//       </div>
//     );
//   if (error)
//     return (
//       <div className="p-8 max-w-7xl mx-auto text-center text-red-500">
//         Error: {error}
//       </div>
//     );
//   if (!movieDetails)
//     return (
//       <div className="p-8 max-w-7xl mx-auto text-center text-gray-600">
//         Movie details not found.
//       </div>
//     );

//   const genres = movieDetails.genres?.map((g) => g.name).join(", ");
//   const directors = movieDetails.credits?.crew
//     ?.filter((member) => member.job === "Director")
//     ?.map((d) => d.name)
//     .join(", ");
//   const cast = movieDetails.credits?.cast
//     ?.slice(0, 5)
//     .map((c) => c.name)
//     .join(", ");
//   const trailer = movieDetails.videos?.results?.find(
//     (vid) => vid.type === "Trailer" && vid.site === "YouTube"
//   );

//   return (
//     <div className="relative min-h-screen bg-gray-100 text-gray-800">
//       {movieDetails.backdrop_path && (
//         <div
//           className="absolute top-0 left-0 w-full h-[400px] bg-cover bg-center filter brightness-50 z-10"
//           style={{
//             backgroundImage: `url(<span class="math-inline">\{API\_BACKDROP\_BASE\_URL\}</span>{movieDetails.backdrop_path})`,
//           }}
//         ></div>
//       )}

//       <div className="relative z-20 flex flex-col md:flex-row items-center md:items-start p-8 max-w-6xl mx-auto gap-8 md:mt-32">
//         <div className="flex-shrink-0 w-80 shadow-2xl rounded-lg overflow-hidden">
//           {movieDetails.poster_path ? (
//             <img
//               src={`<span class="math-inline">\{API\_IMG\_BASE\_URL\}</span>{movieDetails.poster_path}`}
//               alt={movieDetails.title}
//               className="w-full h-auto block"
//             />
//           ) : (
//             <div className="w-full h-[450px] bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-semibold">
//               No Poster Available
//             </div>
//           )}
//         </div>

//         <div className="flex-grow text-left bg-white bg-opacity-95 p-8 rounded-lg shadow-xl">
//           <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
//             {movieDetails.title} ({movieDetails.release_date?.substring(0, 4)})
//           </h1>
//           <p className="text-lg leading-relaxed mb-6">
//             {movieDetails.overview}
//           </p>
//           <p className="mb-2">
//             <strong className="font-semibold">Genres:</strong> {genres || "N/A"}
//           </p>
//           <p className="mb-2">
//             <strong className="font-semibold">Director(s):</strong>{" "}
//             {directors || "N/A"}
//           </p>
//           <p className="mb-2">
//             <strong className="font-semibold">Cast:</strong> {cast || "N/A"}
//           </p>
//           <p className="mb-2">
//             <strong className="font-semibold">TMDB Rating:</strong>{" "}
//             {movieDetails.vote_average?.toFixed(1)} / 10 (
//             {movieDetails.vote_count} votes)
//           </p>
//           <p className="mb-6">
//             <strong className="font-semibold">Runtime:</strong>{" "}
//             {movieDetails.runtime} minutes
//           </p>

//           {localMovieData && (
//             <div className="mt-8 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-md">
//               <h3 className="text-2xl font-bold mb-2">
//                 Our Community's Rating:
//               </h3>
//               <p className="text-lg">
//                 Average:{" "}
//                 <span className="font-bold text-blue-600">
//                   {localMovieData.averageRating?.toFixed(1)}
//                 </span>{" "}
//                 / 5
//               </p>
//               <p className="text-lg">
//                 Total Reviews:{" "}
//                 <span className="font-bold text-blue-600">
//                   {localMovieData.numberOfReviews}
//                 </span>
//               </p>
//             </div>
//           )}
//           {!localMovieData && (
//             <p className="italic text-gray-600 mt-4">
//               No reviews from our community yet. Be the first to add one!
//             </p>
//           )}

//           {trailer && (
//             <a
//               href={`<span class="math-inline">\{YOUTUBE\_BASE\_URL\}</span>{trailer.key}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-block mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
//             >
//               Watch Trailer
//             </a>
//           )}

//           {/* Review Form */}
//           <div className="mt-8 pt-6 border-t border-gray-200">
//             <h3 className="text-3xl font-bold mb-4">Submit Your Review</h3>
//             {reviewMessage && (
//               <p
//                 className={`mb-4 ${
//                   reviewMessage.includes("successfully")
//                     ? "text-green-600"
//                     : "text-red-600"
//                 } font-medium`}
//               >
//                 {reviewMessage}
//               </p>
//             )}
//             <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
//               <div>
//                 <label
//                   htmlFor="rating"
//                   className="block text-lg font-medium mb-2"
//                 >
//                   Rating (0-5):
//                 </label>
//                 <input
//                   type="number"
//                   id="rating"
//                   min="0"
//                   max="5"
//                   step="0.5"
//                   value={reviewRating}
//                   onChange={(e) => setReviewRating(parseFloat(e.target.value))}
//                   required
//                   className="p-3 text-lg border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="reviewText"
//                   className="block text-lg font-medium mb-2"
//                 >
//                   Review Text:
//                 </label>
//                 <textarea
//                   id="reviewText"
//                   value={reviewText}
//                   onChange={(e) => setReviewText(e.target.value)}
//                   rows="6"
//                   placeholder="Write your review here..."
//                   className="p-3 text-lg border border-gray-300 rounded-lg w-full resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 ></textarea>
//               </div>
//               <button
//                 type="submit"
//                 className="px-8 py-4 text-xl font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={!user}
//               >
//                 {user ? "Submit Review" : "Login to Review"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MovieDetailPage;

// client/src/pages/MovieDetailPage.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const MovieDetailPage = () => {
  const { tmdbId } = useParams();
  const { user, token } = useContext(AuthContext);

  const [movieDetails, setMovieDetails] = useState(null);
  const [localMovieData, setLocalMovieData] = useState({
    averageRating: 0,
    numberOfReviews: 0,
  }); // Aggregate data
  const [reviews, setReviews] = useState([]); // Individual reviews
  const [userReview, setUserReview] = useState(null); // Review by the current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false); // State for editing existing review

  const API_IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const API_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
  const YOUTUBE_BASE_URL = "https://www.youtube.com/watch?v=";

  const fetchMovieAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch TMDB external details
      const { data: tmdbData } = await axios.get(`/api/movies/tmdb/${tmdbId}`);
      setMovieDetails(tmdbData);

      // Fetch local movie data (reviews aggregate AND individual reviews)
      const { data: localData } = await axios.get(
        `/api/movies/${tmdbId}/reviews`
      );
      setReviews(localData.reviews);
      setLocalMovieData({
        averageRating: localData.averageRating,
        numberOfReviews: localData.numberOfReviews,
      });

      // Check if current user has reviewed this movie
      if (user) {
        const currentUserReview = localData.reviews.find(
          (review) => review.userId === user.id
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
        setReviewRating(0);
        setReviewText("");
        setIsEditing(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch movie details or reviews."
      );
      console.error("Error fetching movie details/reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieAndReviews();
  }, [tmdbId, user]); // Re-run effect if tmdbId or user changes

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
        movieTitle: movieDetails.title, // Send title to backend for initial movie save
      };

      let response;
      if (isEditing && userReview) {
        // Update existing review
        response = await axios.put(
          `/api/movies/reviews/${userReview._id}`,
          payload,
          config
        );
      } else {
        // Submit new review
        response = await axios.post(
          `/api/movies/${tmdbId}/reviews`,
          payload,
          config
        );
      }

      setReviewMessage(response.data.message);
      // Re-fetch all data to get updated reviews and aggregate
      fetchMovieAndReviews();
    } catch (err) {
      setReviewMessage(
        err.response?.data?.message || "Failed to submit review."
      );
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
      fetchMovieAndReviews(); // Re-fetch all data
    } catch (err) {
      setReviewMessage(
        err.response?.data?.message || "Failed to delete review."
      );
      console.error("Error deleting review:", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-gray-700">
        Loading movie details...
      </div>
    );
  if (error)
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-red-500">
        Error: {error}
      </div>
    );
  if (!movieDetails)
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-gray-600">
        Movie details not found.
      </div>
    );

  const genres = movieDetails.genres?.map((g) => g.name).join(", ");
  const directors = movieDetails.credits?.crew
    ?.filter((member) => member.job === "Director")
    ?.map((d) => d.name)
    .join(", ");
  const cast = movieDetails.credits?.cast
    ?.slice(0, 5)
    .map((c) => c.name)
    .join(", ");

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-800">
      {movieDetails.backdrop_path && (
        <div
          className="absolute top-0 left-0 w-full h-[400px] bg-cover bg-center filter brightness-50 z-10"
          style={{
            backgroundImage: `url(<span class="math-inline">\{API\_BACKDROP\_BASE\_URL\}</span>{movieDetails.backdrop_path})`,
          }}
        ></div>
      )}

      <div className="relative z-20 flex flex-col md:flex-row items-center md:items-start p-8 max-w-6xl mx-auto gap-8 md:mt-32">
        <div className="flex-shrink-0 w-80 shadow-2xl rounded-lg overflow-hidden">
          {movieDetails.poster_path ? (
            <img
              src={`<span class="math-inline">\{API\_IMG\_BASE\_URL\}</span>{movieDetails.poster_path}`}
              alt={movieDetails.title}
              className="w-full h-auto block"
            />
          ) : (
            <div className="w-full h-[450px] bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-semibold">
              No Poster Available
            </div>
          )}
        </div>

        <div className="flex-grow text-left bg-white bg-opacity-95 p-8 rounded-lg shadow-xl">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
            {movieDetails.title} ({movieDetails.release_date?.substring(0, 4)})
          </h1>
          <p className="text-lg leading-relaxed mb-6">
            {movieDetails.overview}
          </p>
          <p className="mb-2">
            <strong className="font-semibold">Genres:</strong> {genres || "N/A"}
          </p>
          <p className="mb-2">
            <strong className="font-semibold">Director(s):</strong>{" "}
            {directors || "N/A"}
          </p>
          <p className="mb-2">
            <strong className="font-semibold">Cast:</strong> {cast || "N/A"}
          </p>
          <p className="mb-2">
            <strong className="font-semibold">TMDB Rating:</strong>{" "}
            {movieDetails.vote_average?.toFixed(1)} / 10 (
            {movieDetails.vote_count} votes)
          </p>
          <p className="mb-6">
            <strong className="font-semibold">Runtime:</strong>{" "}
            {movieDetails.runtime} minutes
          </p>

          {localMovieData.numberOfReviews > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-md">
              <h3 className="text-2xl font-bold mb-2">
                Our Community's Rating:
              </h3>
              <p className="text-lg">
                Average:{" "}
                <span className="font-bold text-blue-600">
                  {localMovieData.averageRating?.toFixed(1)}
                </span>{" "}
                / 5
              </p>
              <p className="text-lg">
                Total Reviews:{" "}
                <span className="font-bold text-blue-600">
                  {localMovieData.numberOfReviews}
                </span>
              </p>
            </div>
          )}
          {localMovieData.numberOfReviews === 0 && (
            <p className="italic text-gray-600 mt-4">
              No reviews from our community yet. Be the first to add one!
            </p>
          )}

          

          {/* Review Form */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-3xl font-bold mb-4">
              {isEditing ? "Edit Your Review" : "Submit Your Review"}
            </h3>
            {reviewMessage && (
              <p
                className={`mb-4 ${
                  reviewMessage.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                } font-medium`}
              >
                {reviewMessage}
              </p>
            )}
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="rating"
                  className="block text-lg font-medium mb-2"
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
                  className="p-3 text-lg border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="reviewText"
                  className="block text-lg font-medium mb-2"
                >
                  Review Text:
                </label>
                <textarea
                  id="reviewText"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="6"
                  placeholder="Write your review here..."
                  className="p-3 text-lg border border-gray-300 rounded-lg w-full resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-8 py-4 text-xl font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!user}
              >
                {user
                  ? isEditing
                    ? "Update Review"
                    : "Submit Review"
                  : "Login to Review"}
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
                  className="px-8 py-4 text-xl font-semibold bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Display Individual Reviews */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-3xl font-bold mb-6">
              All Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-gray-600 italic">
                No individual reviews yet. Be the first to add one!
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-semibold text-blue-700">
                        {review.username}
                      </p>
                      <p className="text-lg font-bold text-yellow-600">
                        {review.rating} / 5
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {review.reviewText || "No review text provided."}
                    </p>
                    <p className="text-sm text-gray-500 italic">
                      Reviewed on:{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    {user && user.id === review.userId && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setUserReview(review);
                            setReviewRating(review.rating);
                            setReviewText(review.reviewText);
                            setIsEditing(true);
                            setReviewMessage("");
                            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to review form
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm"
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
