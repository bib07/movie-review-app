require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require('./routes/authRoutes'); // Import auth routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Movie Review App API",
    version: "1.0.0",
    status: "Server is running successfully!",
  });
});

// Mount Auth Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "dev";

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
});
