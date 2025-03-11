const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get user by credentials
router.get('/users', async (req, res) => {
  try {
    const { name, password } = req.params;
    
    const userCheck = await db.query(
      'SELECT name FROM users WHERE name = $1 AND password = $2',
      [name, password]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with name ${name} not found or expired`
      });
    }
    else {
      return res.status(200).json({
        status: 'success',
        data: {
          user: userCheck.rows[0]
        }
      });
    }

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      details: error.message
    });
  }
});

// Register a new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const nameCheck = await db.query(
      'SELECT name FROM users WHERE name = $1',
      [name]
    );
    
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `User with name ${name} already exists`
      });
    }
    
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    );
    
    return res.status(201).json({
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

// Add login endpoint
router.post('/users/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Validate credentials
    const userCheck = await db.query(
      'SELECT * FROM users WHERE name = $1 AND password = $2',
      [name, password]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password'
      });
    }
    
    // Return the user if credentials match
    return res.status(200).json({
      status: 'success',
      data: {
        user: userCheck.rows[0]
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      details: error.message
    });
  }
});

// Add ready status update endpoint (using name instead of ID)
router.put('/users/:name/ready', async (req, res) => {
  try {
    const { name } = req.params;
    const { isReady } = req.body;
    
    const result = await db.query(
      'UPDATE users SET is_ready = $1 WHERE name = $2 RETURNING *',
      [isReady, name]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with name ${name} not found`
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

// Add route to get users by session code
router.get('/users/session/:sessionCode', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    
    // Check if session exists
    const sessionCheck = await db.query(
      'SELECT session_code FROM sessions WHERE session_code = $1',
      [sessionCode]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Session with code ${sessionCode} not found`
      });
    }
    
    // Get users who have schedules in this session
    const result = await db.query(
      'SELECT DISTINCT u.* FROM users u JOIN schedules s ON u.name = s.user_name WHERE s.session_code = $1',
      [sessionCode]
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
      message: 'Failed to fetch users for session',
      details: error.message
    });
  }
});

module.exports = router;
