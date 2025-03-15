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

// Export only authenticate function
module.exports = {
  authenticate
};
