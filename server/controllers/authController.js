// // server/controllers/authController.js
// const asyncHandler = require("express-async-handler"); // For simplifying error handling
// const User = require("../models/User");
// const generateToken = require("../utils/generateToken");

// // @desc    Register a new user
// // @route   POST /api/auth/register
// // @access  Public
// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   // Check if user already exists
//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     res.status(400); // Bad request
//     throw new Error("User already exists with that email");
//   }

//   // Create new user
//   const user = await User.create({
//     name,
//     email,
//     password, // Password will be hashed by pre-save hook in model
//   });

//   if (user) {
//     res.status(201).json({
//       // 201 Created
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       token: generateToken(user._id), // Generate JWT
//     });
//   } else {
//     res.status(400);
//     throw new Error("Invalid user data");
//   }
// });

// // @desc    Authenticate user & get token
// // @route   POST /api/auth/login
// // @access  Public
// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   // Check for user by email
//   const user = await User.findOne({ email });

//   // Check if user exists and password matches
//   if (user && (await user.matchPassword(password))) {
//     res.json({
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         isAdmin: user.isAdmin,
//       },
//       token: generateToken(user._id), // Generate JWT
//     });
//   } else {
//     res.status(401); // Unauthorized
//     throw new Error("Invalid email or password");
//   }
// });

// module.exports = {
//   registerUser,
//   loginUser,
// };

// server/controllers/authController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken"); // This generates the JWT

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // --- Add console logs for debugging ---
  console.log(
    "Backend Register (authController): Received request for:",
    email
  );

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    console.log("Backend Register (authController): User already exists.");
    res.status(400); // Bad request
    throw new Error("User already exists with that email");
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password, // Password will be hashed by pre-save hook in model
  });

  if (user) {
    console.log("Backend Register (authController): User created:", user.email);
    const token = generateToken(user._id);
    console.log(
      "Backend Register (authController): Generated Token:",
      token ? "YES" : "NO"
    );

    // --- CRITICAL FIX HERE: Standardize response structure ---
    res.status(201).json({
      user: {
        // Nest user data under a 'user' key
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token: token, // Keep token at top level as in login
    });
    console.log("Backend Register (authController): Response sent.");
  } else {
    console.log("Backend Register (authController): Invalid user data.");
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("Backend Login (authController): Received request for:", email);

  // Check for user by email
  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    console.log("Backend Login (authController): User authenticated.");
    const token = generateToken(user._id);
    console.log(
      "Backend Login (authController): Generated Token:",
      token ? "YES" : "NO"
    );

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token: token,
    });
    console.log("Backend Login (authController): Response sent.");
  } else {
    console.log("Backend Login (authController): Invalid credentials.");
    res.status(401); // Unauthorized
    throw new Error("Invalid email or password");
  }
});

module.exports = {
  registerUser,
  loginUser,
};
