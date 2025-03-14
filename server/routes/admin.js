const express = require('express');
const router = express.Router();
const db = require('../config/database');
const adminAuth = require('../middleware/adminAuth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Middleware to protect all admin routes
router.use(adminAuth);

/**
 * Get all users
 * GET /api/v1/admin/users
 */
router.get('/admin/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, is_ready, created_at FROM users ORDER BY created_at DESC'
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

/**
 * Get all sessions
 * GET /api/v1/admin/sessions
 */
router.get('/admin/sessions', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.id, 
        s.session_code,
        s.created_at,
        s.expires_at,
        COALESCE(
          (SELECT COUNT(DISTINCT user_name) FROM schedules WHERE session_code = s.session_code),
          0
        ) AS user_count
      FROM 
        sessions s
      ORDER BY 
        s.created_at DESC
    `);
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        sessions: result.rows
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sessions',
      details: error.message
    });
  }
});

/**
 * Get all schedules
 * GET /api/v1/admin/schedules
 */
router.get('/admin/schedules', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.id,
        s.session_code,
        s.user_name,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.created_at
      FROM 
        schedules s
      ORDER BY 
        s.created_at DESC
      LIMIT 100
    `);
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        schedules: result.rows
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch schedules',
      details: error.message
    });
  }
});

/**
 * Update user (including role)
 * PUT /api/v1/admin/users/:id
 */
router.put('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    
    // Start building the query
    let query = 'UPDATE users SET ';
    const updates = [];
    const values = [];
    let paramCounter = 1;
    
    // Add fields to update if they exist
    if (name) {
      updates.push(`name = $${paramCounter}`);
      values.push(name);
      paramCounter++;
    }
    
    if (email) {
      updates.push(`email = $${paramCounter}`);
      values.push(email);
      paramCounter++;
    }
    
    if (role) {
      updates.push(`role = $${paramCounter}`);
      values.push(role);
      paramCounter++;
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updates.push(`password = $${paramCounter}`);
      values.push(hashedPassword);
      paramCounter++;
    }
    
    // If no fields to update
    if (updates.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No fields to update'
      });
    }
    
    // Complete the query
    query += updates.join(', ') + ` WHERE id = $${paramCounter} RETURNING id, name, email, role, is_ready, created_at`;
    values.push(id);
    
    const result = await db.query(query, values);
    
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
      message: 'Failed to update user',
      details: error.message
    });
  }
});

/**
 * Delete user
 * DELETE /api/v1/admin/users/:id
 */
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${id} not found`
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      details: error.message
    });
  }
});

/**
 * Delete session
 * DELETE /api/v1/admin/sessions/:code
 */
router.delete('/admin/sessions/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await db.query(
      'DELETE FROM sessions WHERE session_code = $1 RETURNING id',
      [code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Session with code ${code} not found`
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete session',
      details: error.message
    });
  }
});

/**
 * Extend session expiration (add 24 hours)
 * PUT /api/v1/admin/sessions/:code/extend
 */
router.put('/admin/sessions/:code/extend', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await db.query(
      'UPDATE sessions SET expires_at = NOW() + INTERVAL \'24 hours\' WHERE session_code = $1 RETURNING *',
      [code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Session with code ${code} not found`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        session: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to extend session',
      details: error.message
    });
  }
});


module.exports = router;
