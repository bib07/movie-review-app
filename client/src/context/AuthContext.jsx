// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage if token exists
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('userInfo')) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // Use your backend port

  // Function to register a user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/register`,
        { name, email, password },
        config
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return true; // Indicate success
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
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
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        config
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return true; // Indicate success
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      setLoading(false);
      return false; // Indicate failure
    }
  };

  // Function to log out a user
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // Effect to load user info from localStorage on initial render
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        setError // Allow components to clear errors
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