const express = require('express');
const router = express.Router();
const db = require('../config/database');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { isValidSessionCode, isValidUsername } = require('../utils/validation');

// Helper function to generate a random session code (8 characters)
function generateSessionCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 8);
}

// Create a new session
router.post('/sessions', authenticate, async (req, res) => {
  try {
    // Generate a unique session code
    let sessionCode;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10; // Add a maximum retry count
    
    // Keep generating codes until we find a unique one (with retry limit)
    while (!isUnique && attempts < MAX_ATTEMPTS) {
      attempts++;
      sessionCode = generateSessionCode();
      const existingSession = await db.query(
        'SELECT id FROM sessions WHERE session_code = $1',
        [sessionCode]
      );
      isUnique = existingSession.rows.length === 0;
    }
    
    // Check if we exceeded retry limit
    if (attempts >= MAX_ATTEMPTS) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate unique session code after multiple attempts'
      });
    }
    
    // Insert the new session into the database (critical write operation)
    const result = await db.client.query(
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

// Get all active sessions for a specific user - SPECIFIC ROUTE FIRST
router.get('/sessions/user/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    
    // Validate username
    if (!isValidUsername(name)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid username format'
      });
    }
    
    // Get all active sessions for this user (read operation)
    const result = await db.query(`
      SELECT 
        s.session_code, 
        s.created_at,
        s.expires_at,
        ARRAY_AGG(DISTINCT u.name) AS user_names
      FROM 
        sessions s
      JOIN 
        schedules sch ON s.session_code = sch.session_code 
      JOIN 
        users u ON sch.user_name = u.name
      WHERE 
        EXISTS (
          SELECT 1 FROM schedules 
          WHERE session_code = s.session_code 
          AND user_name = $1
        )
        AND s.expires_at > NOW()
      GROUP BY 
        s.session_code, s.created_at, s.expires_at
      ORDER BY 
        s.created_at DESC
    `, [name]);
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        sessions: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sessions',
      details: error.message
    });
  }
});

// Get specific session by code - GENERIC ROUTE SECOND
router.get('/sessions/:code', authenticate, async (req, res) => {
  try {
    const { code } = req.params;
    
    // Validate session code
    if (!isValidSessionCode(code)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid session code format'
      });
    }
    
    // Get the session and check if it exists and hasn't expired (read operation)
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

// Remove a user from a session
router.delete('/sessions/:code/users/:name', authenticate, async (req, res) => {
  try {
    const { code, name } = req.params;
    
    // Validate session code and username
    if (!isValidSessionCode(code)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid session code format'
      });
    }
    
    if (!isValidUsername(name)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid username format'
      });
    }
    
    // Delete all schedules for this user in the session (critical write operation)
    const result = await db.client.query(
      'DELETE FROM schedules WHERE session_code = $1 AND user_name = $2 RETURNING id',
      [code, name]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `No records found for user ${name} in session ${code}`
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: `User ${name} removed from session ${code}`,
      data: {
        deletedCount: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error removing user from session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove user from session',
      details: error.message
    });
  }
});

module.exports = router;
