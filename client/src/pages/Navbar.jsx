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
        {user ? (
          <>
            <li className="font-semibold text-sky-400">
              Welcome, {user.username}!
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
