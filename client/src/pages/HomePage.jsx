
import React from 'react';

const HomePage = () => {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Movie Review App!</h1>
      <p className="text-lg text-gray-600">Your ultimate destination for movie reviews.</p>
      <div className="mt-8">
        <a href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4">Login</a>
        <a href="/register" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Register</a>
      </div>
    </div>
  );
};

export default HomePage;