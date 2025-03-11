const express = require('express');
const router = express.Router();
const db = require('../config/database');
const passport = require('passport'); // <-- add this line

// Change session user route to be distinct
router.get('/users/:id', async (req, res) => {
  try {
    const { name, passport } = req.params;
    
    // Check if user exists
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Session with ID ${sessionId} not found or expired`
      });
    }
    
    // Get all users for this session
    const result = await db.query(
      'SELECT * FROM users WHERE session_id = $1 ORDER BY created_at',
      [sessionId]
    );
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        users: result.rows
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      details: error.message
    });
  }
});


module.exports = router;
