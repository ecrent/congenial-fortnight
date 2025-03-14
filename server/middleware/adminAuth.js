const { verifyToken } = require('../utils/jwt');
const db = require('../config/database');

/**
 * Middleware to verify if the user is an admin
 * Uses JWT token from Authorization header
 */
const adminAuth = async (req, res, next) => {
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

    // Check if user exists and is an admin
    const result = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied: Admin privileges required'
      });
    }
    
    // User is an admin, proceed to next middleware/route handler
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed',
      details: error.message
    });
  }
};

module.exports = adminAuth;
