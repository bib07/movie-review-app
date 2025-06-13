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
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
      <h1 className="text-2xl font-bold">
        <Link to="/" className="text-white hover:text-gray-300">
          ReviewMov-A movie review app
        </Link>
      </h1>
      <ul className="flex space-x-6">
        <li>
          <Link
            to="/"
            className="hover:text-gray-300 transition-colors duration-200"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/search"
            className="hover:text-gray-300 transition-colors duration-200"
          >
            Search Movies
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard" // <--- ADD THIS LINK
            className="hover:text-gray-300 transition-colors duration-200"
          >
            My Reviews
          </Link>
        </li>
        {user ? (
          <>
            <li className="font-semibold text-sky-400">
              Welcome, {user.name}!
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition-colors duration-200"
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
                className="hover:text-gray-300 transition-colors duration-200"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-gray-300 transition-colors duration-200"
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

// // client/src/components/Navbar.jsx
// import React, { useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';

// const Navbar = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <nav className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 shadow-lg">
//       <div className="container mx-auto flex justify-between items-center">
//         <Link to="/" className="text-white text-3xl font-extrabold tracking-wide hover:text-blue-200 transition duration-300">
//           MovieApp
//         </Link>
//         <div className="flex items-center space-x-6">
//           {user ? (
//             <>
//               <Link
//                 to="/dashboard" // <--- ADD THIS LINK
//                 className="text-white text-lg font-medium hover:text-blue-200 transition duration-300"
//               >
//                 My Reviews
//               </Link>
//               <span className="text-white text-lg font-semibold">
//                 Hello, {user.name}
//               </span>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link
//                 to="/login"
//                 className="text-white text-lg font-medium hover:text-blue-200 transition duration-300"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
//               >
//                 Register
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
