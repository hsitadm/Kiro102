const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - verifies JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Not authorized to access this route',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param {...String} roles - Roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be added by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Not authorized to access this route',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: `User role ${req.user.role} is not authorized to access this route`,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    next();
  };
};