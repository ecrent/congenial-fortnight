const { verifyToken } = require('../utils/jwt');
const db = require('../config/database'); // Fix the import path

/**
 * Middleware to validate JWT token and add user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth middleware - token extracted:', token ? token.substring(0, 10) + '...' : 'No token');
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth middleware - decoded token:', decoded ? {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role
      } : 'Invalid token');
    }

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

    // Check if user still exists in the database
    const userExists = await db.query('SELECT id FROM users WHERE id = $1', [decoded.id]);
    if (userExists.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists'
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
