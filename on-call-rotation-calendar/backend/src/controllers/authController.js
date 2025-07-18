const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'User already exists',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'COLLABORATOR' // Default role is COLLABORATOR
    });

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      code: 'CREATED',
      message: 'User registered successfully',
      data: {
        user,
        token
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'Please provide email and password',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      code: 'SUCCESS',
      message: 'Login successful',
      data: {
        user,
        token
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // User is already available in req.user from protect middleware
    res.status(200).json({
      code: 'SUCCESS',
      message: 'User retrieved successfully',
      data: req.user,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'Please provide current password and new password',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Current password is incorrect',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user);

    res.status(200).json({
      code: 'SUCCESS',
      message: 'Password updated successfully',
      data: { token },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};