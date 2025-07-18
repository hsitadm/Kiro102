const User = require('../models/User');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      code: 'SUCCESS',
      message: 'Users retrieved successfully',
      data: users,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    res.status(200).json({
      code: 'SUCCESS',
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res, next) => {
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
      role
    });

    res.status(201).json({
      code: 'CREATED',
      message: 'User created successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { username, email, role } = req.body;

    // Find user
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      code: 'SUCCESS',
      message: 'User updated successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    await user.deleteOne();

    res.status(200).json({
      code: 'SUCCESS',
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  } catch (error) {
    next(error);
  }
};