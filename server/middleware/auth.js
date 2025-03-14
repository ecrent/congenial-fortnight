const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to validate JWT token and add user to request
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: Invalid or expired token'
      });
    }

    // Validate token contents
    if (!decoded.id || !decoded.name) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: Malformed token'
      });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      status: 'fail',
      message: 'Authentication failed',
      details: error.message
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  // First authenticate the user
  authenticate(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        status: 'fail',
        message: 'Access denied: Admin privileges required'
      });
    }
  });
};

module.exports = {
  authenticate,
  requireAdmin
};
