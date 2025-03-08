const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Change session user route to be distinct
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const sessionCheck = await db.query(
      'SELECT id FROM sessions WHERE id = $1 AND expires_at > NOW()',
      [sessionId]
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

router.post('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name } = req.body;
    
    // Check if session exists
    const sessionCheck = await db.query(
      'SELECT id FROM sessions WHERE id = $1 AND expires_at > NOW()',
      [sessionId]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Session with ID ${sessionId} not found or expired`
      });
    }
    
    // Create the user
    const result = await db.query(
      'INSERT INTO users (session_id, name) VALUES ($1, $2) RETURNING *',
      [sessionId, name]
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      details: error.message
    });
  }
});

/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      details: error.message
    });
  }
});

/**
 * Update user ready status
 * PUT /api/v1/users/:id/ready
 */
router.put('/:id/ready', async (req, res) => {
  try {
    const { id } = req.params;
    const { isReady } = req.body;
    
    const result = await db.query(
      'UPDATE users SET is_ready = $1 WHERE id = $2 RETURNING *',
      [isReady, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user ready status',
      details: error.message
    });
  }
});

module.exports = router;
