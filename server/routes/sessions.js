const express = require('express');
const router = express.Router();
const db = require('../config/database');
const crypto = require('crypto');

// Helper function to generate a random session code (8 characters)
function generateSessionCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 8);
}

/**
 * Get all sessions 
 * GET /api/v1/sessions
 */
router.get('/', async (req, res) => {
  try {
    // Get all active sessions
    const result = await db.query(
      'SELECT * FROM sessions WHERE expires_at > NOW()'
    );
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        sessions: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sessions',
      details: error.message
    });
  }
});

/**
 * Create a new session
 * POST /api/v1/sessions
 */
router.post('/', async (req, res) => {
  try {
    // Generate a unique session code
    let sessionCode;
    let isUnique = false;
    
    // Keep generating codes until we find a unique one
    while (!isUnique) {
      sessionCode = generateSessionCode();
      const existingSession = await db.query(
        'SELECT id FROM sessions WHERE session_code = $1',
        [sessionCode]
      );
      isUnique = existingSession.rows.length === 0;
    }
    
    // Insert the new session into the database
    const result = await db.query(
      'INSERT INTO sessions (session_code) VALUES ($1) RETURNING *',
      [sessionCode]
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        session: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create session',
      details: error.message
    });
  }
});

/**
 * Get session by code
 * GET /api/v1/sessions/:code
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get the session and check if it exists and hasn't expired
    const result = await db.query(
      'SELECT * FROM sessions WHERE session_code = $1 AND expires_at > NOW()',
      [code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found or has expired'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        session: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch session',
      details: error.message
    });
  }
});

/**
 * Update session expiration
 * PUT /api/v1/sessions/:code/extend
 */
router.put('/:code/extend', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Extend the session expiration by 24 hours from now
    const result = await db.query(
      'UPDATE sessions SET expires_at = NOW() + INTERVAL \'24 hours\' WHERE session_code = $1 AND expires_at > NOW() RETURNING *',
      [code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found or has already expired'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        session: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error extending session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to extend session',
      details: error.message
    });
  }
});

/**
 * Delete expired sessions (cleanup endpoint)
 * DELETE /api/v1/sessions/cleanup
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM sessions WHERE expires_at < NOW() RETURNING id'
    );
    
    res.status(200).json({
      status: 'success',
      message: `Removed ${result.rows.length} expired sessions`
    });
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clean up expired sessions',
      details: error.message
    });
  }
});

module.exports = router;
