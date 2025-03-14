const db = require('../config/database');

/**
 * Middleware to verify if the user is an admin
 * Requires the user's name to be passed in the request body or params
 */
const adminAuth = async (req, res, next) => {
  try {
    // Get user name from request (could be in body, params, or query)
    const userName = req.body.user_name || req.params.name || req.query.name;
    
    if (!userName) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: No user provided'
      });
    }
    
    // Check if user exists and is an admin
    const result = await db.query(
      'SELECT role FROM users WHERE name = $1',
      [userName]
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
