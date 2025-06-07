// client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null); // For local form messages

  const { register, error, loading, user, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/dashboard');
    }
    // Clear errors/messages on component mount or unmount
    return () => {
      setError(null);
      setMessage(null);
    };
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null); // Clear context error too

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
        setMessage('Please fill in all fields.');
        return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard'); // Navigate on successful registration
    }
    // Error will be set by the context if registration fails
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      {message && <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="confirm-password"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-green-500 hover:text-green-800"
            href="/login"
          >
            Already have an account? Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;