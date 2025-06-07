// client/src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome, {user ? user.name : 'Guest'}!
      </h1>
      <p className="text-lg text-gray-600 mb-6">This is your protected dashboard.</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;