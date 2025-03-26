const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { isValidEmail, isValidPassword, isValidUsername } = require('../utils/validation');

// Register a new user
router.post('/users/register', async (req, res) => {
  // Only log in development environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Registration attempt:', { 
      name: req.body.name,
      email: req.body.email,
      passwordProvided: !!req.body.password 
    });
  }
  
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }
    
    if (!isValidUsername(name)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid username format. Use 3-30 alphanumeric characters, underscores, or hyphens.'
      });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid email format'
      });
    }
    
    if (!isValidPassword(password)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user exists in database
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
    
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // User registration - critical write operation using db.query
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Registration error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail
      });
    } else {
      console.error('Registration error:', error.message);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      details: error.message
    });
  }
});

// Login endpoint with validation
router.post('/users/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Input validation
    if (!name || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username and password are required'
      });
    }
    
    // Fetch user by name - use db.query for consistency
    const userResult = await db.query(
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

// Token refresh endpoint with validation
router.post('/users/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        status: 'fail',
        message: 'Refresh token is required'
      });
    }
    
    const decoded = verifyToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Get user from database - use db.query for consistency
    const userResult = await db.query(
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

// Ready status update endpoint with validation
router.put('/users/:name/ready', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const { isReady } = req.body;
    
    // Input validation
    if (typeof isReady !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'isReady must be a boolean value'
      });
    }
    
    // Verify the authenticated user is updating their own status
    if (req.user.name !== name) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update your own ready status'
      });
    }
    
    // User status update using db.query
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

// Get users by session code with validation
router.get('/users/session/:sessionCode', authenticate, async (req, res) => {
  try {
    const { sessionCode } = req.params;
    
    // Input validation
    if (!sessionCode || sessionCode.length !== 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid session code is required'
      });
    }
    
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
