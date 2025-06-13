// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage"; // Import the new dashboard page
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import Navbar from "./pages/NavBar";
import MovieSearchPage from "./pages/MovieSearchPage";
import MovieDetailPage from "./pages/MovieDetailPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header/Navbar would go here later */}
        <Navbar />
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<MovieSearchPage />} />
            <Route path="/movie/:tmdbId" element={<MovieDetailPage />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Future protected routes will go here, e.g., /movies/add, /profile */}
            </Route>
            {/* Catch-all for 404 (optional, good practice) */}
            <Route
              path="*"
              element={
                <h1 className="text-center text-red-500 text-3xl">
                  404 - Page Not Found
                </h1>
              }
            />
            <Route path="/dashboard" element={<DashboardPage />} />{" "}
            {/* Add this new route */}
          </Routes>
        </main>
        {/* Footer would go here later */}
      </div>
    </Router>
  );
}

export default App;
