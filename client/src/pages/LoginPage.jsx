// client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, error, loading, user, setError } = useAuth(); // Get auth context values
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/dashboard'); // Or wherever your main app page is
    }
    // Clear error on component mount or unmount
    return () => {
      setError(null);
    };
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard'); // Navigate on successful login
    }
    // Error will be set by the context if login fails
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Sign In'}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/register"
          >
            Don't have an account? Register
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
