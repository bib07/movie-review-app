


// client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4"> {/* Darker background for the whole page */}
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 transform transition-all duration-300 hover:shadow-indigo-500/20"> {/* Dark card, larger shadow, subtle hover */}
        <h2 className="text-3xl font-extrabold text-center text-white mb-8"> {/* Larger, bolder title, white text */}
          Sign In
        </h2>

        {/* Error Display */}
        {error && (
          <div className="bg-red-800 bg-opacity-30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing between form fields */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="appearance-none border border-gray-700 rounded-lg w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="appearance-none border border-gray-700 rounded-lg w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"> {/* Responsive layout for buttons */}
            <button
              className="w-full sm:w-auto flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Sign In'}
            </button>
            <Link
              className="inline-block text-center w-full sm:w-auto flex-grow font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 text-lg py-3"
              to="/register" 
            >
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;