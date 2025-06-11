// // client/src/context/AuthContext.jsx
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   // Initialize state from localStorage if token exists
//   const [user, setUser] = useState(
//     JSON.parse(localStorage.getItem('userInfo')) || null
//   );
//   const [token, setToken] = useState(localStorage.getItem('token') || null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // Use your backend port

//   // Function to register a user
//   const register = async (name, email, password) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       };
//       const { data } = await axios.post(
//         `${API_BASE_URL}/auth/register`,
//         { name, email, password },
//         config
//       );

//       setUser(data);
//       localStorage.setItem('userInfo', JSON.stringify(data));
//       setLoading(false);
//       return true; // Indicate success
//     } catch (err) {
//       setError(err.response && err.response.data.message ? err.response.data.message : err.message);
//       setLoading(false);
//       return false; // Indicate failure
//     }
//   };

//   // Function to log in a user
//   const login = async (email, password) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       };
//       const { data } = await axios.post(
//         `${API_BASE_URL}/auth/login`,
//         { email, password },
//         config
//       );

//       setUser(data);
//       localStorage.setItem('userInfo', JSON.stringify(data));
//       setLoading(false);
//       return true; // Indicate success
//     } catch (err) {
//       setError(err.response && err.response.data.message ? err.response.data.message : err.message);
//       setLoading(false);
//       return false; // Indicate failure
//     }
//   };

//   // Function to log out a user
//   const logout = () => {
//     localStorage.removeItem('userInfo');
//     setUser(null);
//   };

//   // Effect to load user info from localStorage on initial render
//   useEffect(() => {
//     const storedUserInfo = localStorage.getItem('userInfo');
//     if (storedUserInfo) {
//       setUser(JSON.parse(storedUserInfo));
//     }
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         error,
//         register,
//         login,
//         logout,
//         setError // Allow components to clear errors
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use the AuthContext
// export const useAuth = () => {
//   return useContext(AuthContext);
// };






// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage 'userInfo' key
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || null
  );
  // NEW: Initialize token state
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"; // Use your backend port

  // MODIFIED: Effect to load user info and token from localStorage on initial render
  // and set default Axios header
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    const storedToken = localStorage.getItem("token"); // NEW: Get token from localStorage

    if (storedUserInfo) {
      try {
        setUser(JSON.parse(storedUserInfo));
      } catch (e) {
        console.error("Failed to parse user info from localStorage", e);
        localStorage.removeItem("userInfo");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    // NEW: Set token state if found in localStorage
    if (storedToken) {
      setToken(storedToken);
      // NEW: Set default Authorization header for Axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    } else {
      setToken(null);
      delete axios.defaults.headers.common["Authorization"]; // NEW: Clear if no token
    }
    // setLoading(false); // You might want to uncomment this if loading state is related to this initial load
  }, []); // Empty dependency array means this runs once on mount

  // Function to register a user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/register`,
        { name, email, password },
        config
      );

      // MODIFIED: Backend should return { user: {id, name, email}, token: 'jwt_token' }
      const { user: userData, token: userToken } = data; // NEW: Destructure user and token

      if (userData && userToken) {
        // NEW: Ensure both are present
        setUser(userData); // Set user object
        setToken(userToken); // NEW: Set token state

        localStorage.setItem("userInfo", JSON.stringify(userData)); // Store user details
        localStorage.setItem("token", userToken); // NEW: Store token separately

        // NEW: Set default Authorization header immediately after successful login/register
        axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;

        setLoading(false);
        return true; // Indicate success
      } else {
        // NEW: Handle case where token or user data is missing from backend response
        setError(
          "Registration successful, but user data or token missing from response. Please check backend."
        );
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
      return false; // Indicate failure
    }
  };

  // Function to log in a user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        config
      );

      // MODIFIED: Backend should return { user: {id, name, email}, token: 'jwt_token' }
      const { user: userData, token: userToken } = data; // NEW: Destructure user and token

      if (userData && userToken) {
        // NEW: Ensure both are present
        setUser(userData); // Set user object
        setToken(userToken); // NEW: Set token state

        localStorage.setItem("userInfo", JSON.stringify(userData)); // Store user details
        localStorage.setItem("token", userToken); // NEW: Store token separately

        // NEW: Set default Authorization header immediately after successful login/register
        axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;

        setLoading(false);
        return true; // Indicate success
      } else {
        // NEW: Handle case where token or user data is missing from backend response
        setError(
          "Login successful, but user data or token missing from response. Please check backend."
        );
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
      return false; // Indicate failure
    }
  };

  // Function to log out a user
  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token"); // NEW: Remove token from localStorage
    setUser(null);
    setToken(null); // NEW: Clear token from state
    delete axios.defaults.headers.common["Authorization"]; // NEW: Clear default header
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // NEW: Expose token through context
        loading,
        error,
        register,
        login,
        logout,
        setError, // Allow components to clear errors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
