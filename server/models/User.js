// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // Email must be unique
      match: [/.+@.+\..+/, 'Please use a valid email address'], // Basic email regex validation
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Middleware to hash password before saving (pre-save hook)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next(); // If password is not modified, move to next middleware
  }

  // Hash password
  const salt = await bcrypt.genSalt(10); // Generate salt
  this.password = await bcrypt.hash(this.password, salt); // Hash and replace plaintext password
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;