const db = require('../config/database');

/**
 * Middleware to check if the authenticated user has admin privileges
 * Must be used after the authenticate middleware
 */
const isAdmin = async (req, res, next) => {
  try {
    // Ensure user is authenticated first
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required'
      });
    }

    // After extracting user info:
    if (process.env.NODE_ENV !== 'production') {
      console.log('Admin middleware - checking user:', req.user ? {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      } : 'No user in request');
    }

    // Check if the user has admin role
    const result = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    // After database query:
    if (process.env.NODE_ENV !== 'production') {
      console.log('Admin middleware - DB role check result:', result.rows.length > 0 ? result.rows[0].role : 'No role found');
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Admin privileges required'
      });
    }

    // User is an admin, proceed
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authorization failed',
      details: error.message
    });
  }
};

module.exports = {
  isAdmin
};
