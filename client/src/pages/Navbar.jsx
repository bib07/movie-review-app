// // client/src/components/Navbar.js
// import React, { useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext"; // Ensure this path is correct

// const Navbar = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <nav className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
//       <h1 className="text-2xl font-bold">
//         <Link to="/" className="text-white hover:text-gray-300">
//           ReviewMov-A movie review app
//         </Link>
//       </h1>
//       <ul className="flex space-x-6">
//         <li>
//           <Link
//             to="/"
//             className="hover:text-gray-300 transition-colors duration-200"
//           >
//             Home
//           </Link>
//         </li>
//         <li>
//           <Link
//             to="/search"
//             className="hover:text-gray-300 transition-colors duration-200"
//           >
//             Search Movies
//           </Link>
//         </li>
//         <li>
//           <Link
//             to="/dashboard" // <--- ADD THIS LINK
//             className="hover:text-gray-300 transition-colors duration-200"
//           >
//             My Profile
//           </Link>
//         </li>
//         {user ? (
//           <>
//             <li className="font-semibold text-sky-400">
//               Welcome, {user.name}!
//             </li>
//             <li>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition-colors duration-200"
//               >
//                 Logout
//               </button>
//             </li>
//           </>
//         ) : (
//           <>
//             <li>
//               <Link
//                 to="/login"
//                 className="hover:text-gray-300 transition-colors duration-200"
//               >
//                 Login
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="/register"
//                 className="hover:text-gray-300 transition-colors duration-200"
//               >
//                 Register
//               </Link>
//             </li>
//           </>
//         )}
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;

// client/src/components/Navbar.js
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Ensure this path is correct

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    // Outer Container: Darker background, subtle gradient for depth, more padding, slightly rounded corners.
    // Increased z-index to ensure it stays on top.
    <nav className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900 to-slate-800 text-white shadow-lg z-50 relative">
      {/* Brand/Title Section */}
      <h1 className="text-3xl font-extrabold tracking-tight">
        {" "}
        {/* Larger, bolder, slightly tighter spacing */}
        <Link
          to="/"
          className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 transform hover:scale-105 inline-block"
        >
          {" "}
          {/* Pop of color, scale on hover */}
          ReviewMov
          <span className="text-lg font-medium block mt-[-4px] text-gray-400">
            Your Ultimate Movie Hub
          </span>{" "}
          {/* Subtitle for branding */}
        </Link>
      </h1>

      {/* Navigation Links */}
      <ul className="flex items-center space-x-8 text-lg font-medium">
        {" "}
        {/* Increased spacing and font size */}
        <li>
          <Link
            to="/"
            className="text-gray-200 hover:text-indigo-300 transition-all duration-300 relative group" // Added group for underline effect
          >
            Home
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>{" "}
            {/* Underline effect */}
          </Link>
        </li>
        <li>
          <Link
            to="/search"
            className="text-gray-200 hover:text-indigo-300 transition-all duration-300 relative group"
          >
            Search Movies
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard"
            className="text-gray-200 hover:text-indigo-300 transition-all duration-300 relative group"
          >
            My Profile
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </li>
        {/* Conditional Rendering for Auth */}
        {user ? (
          <>
            <li className="font-semibold text-emerald-400 text-xl tracking-wide">
              {" "}
              {/* Brighter, larger, more prominent welcome */}
              Hello, {user.name}!
            </li>
            <li>
              <button
                onClick={handleLogout}
                // Updated button style: more vibrant red, subtle padding, slight scale on hover
                className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className="text-gray-200 hover:text-indigo-300 transition-all duration-300 relative group"
              >
                Login
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                // Register button: a standout primary color, slightly more prominent
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
