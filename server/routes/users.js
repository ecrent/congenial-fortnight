const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

// Register a new user
router.post('/users/register', async (req, res) => {
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
    	
    const emailCheck = await db.query(
      'SELECT email FROM users WHERE email = $1',
      [email]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `This email ${email} is already registered`
      });
    }
    
    // Hash the password before storing it.
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await db.client.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );
    
    const newUser = result.rows[0];
    
    // Generate JWT tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    
    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          is_ready: newUser.is_ready
        },
        accessToken,
        refreshToken
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

// Add login endpoint (modified to use bcrypt for password verification)
router.post('/users/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Fetch user by name
    const userResult = await db.client.query(
      'SELECT * FROM users WHERE name = $1',
      [name]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password'
      });
    }
    
    const user = userResult.rows[0];
    // Compare provided password with stored hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password'
      });
    }
    
    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_ready: user.is_ready
        },
        accessToken,
        refreshToken
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

// Add token refresh endpoint
router.post('/users/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        status: 'fail',
        message: 'Refresh token is required'
      });
    }
    
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Get user from database
    const userResult = await db.client.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    const user = userResult.rows[0];
    
    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh token',
      details: error.message
    });
  }
});

// Add ready status update endpoint (using name instead of ID)
// Now protected with authentication
router.put('/users/:name/ready', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const { isReady } = req.body;
    
    // Verify the authenticated user is updating their own status
    if (req.user.name !== name) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update your own ready status'
      });
    }
    
    const result = await db.client.query(
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

// Add route to get users by session code - now protected
router.get('/users/session/:sessionCode', authenticate, async (req, res) => {
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
