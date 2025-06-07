// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You can render a loading spinner here
    return <div className="text-center py-10">Loading user...</div>;
  }

  // If user is null, they are not logged in, redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;