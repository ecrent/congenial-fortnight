const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { 
  isValidEmail, 
  isValidUsername, 
  isValidPassword,
  isValidRole 
} = require('../utils/validation');

// Apply authentication and admin check to all routes
router.use(authenticate, isAdmin);

/**
 * Get all users
 * GET /api/v1/admin/users
 */
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, is_ready, created_at FROM users ORDER BY id'
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
 * Get a specific user
 * GET /api/v1/admin/users/:id
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID'
      });
    }
    
    const result = await db.query(
      'SELECT id, name, email, role, is_ready, created_at FROM users WHERE id = $1',
      [userId]
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
      message: 'Failed to fetch user',
      details: error.message
    });
  }
});

/**
 * Update a user
 * PUT /api/v1/admin/users/:id
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    
    // Validate ID
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID'
      });
    }
    
    // Check if user exists
    const userCheck = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${id} not found`
      });
    }
    
    const currentUser = userCheck.rows[0];
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      if (!isValidUsername(name)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid username format'
        });
      }
      
      // Check if the new username is already taken by another user
      if (name !== currentUser.name) {
        const nameCheck = await db.query(
          'SELECT id FROM users WHERE name = $1 AND id != $2',
          [name, userId]
        );
        
        if (nameCheck.rows.length > 0) {
          return res.status(400).json({
            status: 'fail',
            message: `Username ${name} is already taken`
          });
        }
      }
      
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid email format'
        });
      }
      
      // Check if the new email is already used by another user
      if (email !== currentUser.email) {
        const emailCheck = await db.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, userId]
        );
        
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            status: 'fail',
            message: `Email ${email} is already registered`
          });
        }
      }
      
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    if (role !== undefined) {
      if (!isValidRole(role)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid role. Must be "user" or "admin"'
        });
      }
      
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    
    if (password !== undefined) {
      if (!isValidPassword(password)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Password must be at least 6 characters long'
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No valid fields to update'
      });
    }
    
    // Add user ID to values array
    values.push(userId);
    
    // Execute update query
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, is_ready, created_at`,
      values
    );
    
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
 * Delete a user
 * DELETE /api/v1/admin/users/:id
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID'
      });
    }
    
    // Check if user exists
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${id} not found`
      });
    }
    
    // Prevent admins from deleting their own account via this route
    if (userId === req.user.id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot delete your own account using admin API'
      });
    }
    
    // Delete the user - cascading delete will remove their schedules too
    await db.client.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    
    // Return 204 No Content for successful deletion
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
 * Grant or revoke admin privileges
 * PATCH /api/v1/admin/users/:id/role
 */
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate ID and role
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID'
      });
    }
    
    if (!isValidRole(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }
    
    // Check if user exists
    const userCheck = await db.query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${id} not found`
      });
    }
    
    // Prevent admins from removing their own admin privileges
    if (userId === req.user.id && role !== 'admin') {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot remove your own admin privileges'
      });
    }
    
    // Update the user's role
    const result = await db.client.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, is_ready',
      [role, userId]
    );
    
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
      message: 'Failed to update user role',
      details: error.message
    });
  }
});

/**
 * Get all schedules for admin management
 * GET /api/v1/admin/schedules
 */
router.get('/schedules', async (req, res) => {
  try {
    // Optional filtering by session code and/or username
    const { session_code, user_name } = req.query;
    
    let query = 'SELECT s.*, u.name as user_name, ses.session_code FROM schedules s JOIN users u ON s.user_name = u.name JOIN sessions ses ON s.session_code = ses.session_code';
    let params = [];
    let conditions = [];
    
    if (session_code) {
      params.push(session_code);
      conditions.push(`s.session_code = $${params.length}`);
    }
    
    if (user_name) {
      params.push(user_name);
      conditions.push(`s.user_name = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY s.session_code, s.user_name, s.day_of_week, s.start_time';
    
    const result = await db.query(query, params);
    
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
 * Update a schedule entry
 * PUT /api/v1/admin/schedules/:id
 */
router.put('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time } = req.body;
    
    // Validate schedule ID
    const scheduleId = parseInt(id);
    if (isNaN(scheduleId) || scheduleId <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid schedule ID'
      });
    }
    
    // Check if schedule exists
    const scheduleCheck = await db.query(
      'SELECT * FROM schedules WHERE id = $1',
      [scheduleId]
    );
    
    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Schedule with ID ${id} not found`
      });
    }
    
    // Validate inputs
    if (day_of_week !== undefined && !Number.isInteger(parseInt(day_of_week))) {
      return res.status(400).json({
        status: 'fail',
        message: 'Day of week must be a number between 0 and 6'
      });
    }
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (day_of_week !== undefined) {
      updates.push(`day_of_week = $${paramCount++}`);
      values.push(parseInt(day_of_week));
    }
    
    if (start_time !== undefined) {
      updates.push(`start_time = $${paramCount++}`);
      values.push(start_time);
    }
    
    if (end_time !== undefined) {
      updates.push(`end_time = $${paramCount++}`);
      values.push(end_time);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No valid fields to update'
      });
    }
    
    // Add schedule ID to values array
    values.push(scheduleId);
    
    // Execute update query
    const result = await db.client.query(
      `UPDATE schedules SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update schedule',
      details: error.message
    });
  }
});

/**
 * Delete a schedule entry
 * DELETE /api/v1/admin/schedules/:id
 */
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate schedule ID
    const scheduleId = parseInt(id);
    if (isNaN(scheduleId) || scheduleId <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid schedule ID'
      });
    }
    
    // Check if schedule exists
    const scheduleCheck = await db.query(
      'SELECT id FROM schedules WHERE id = $1',
      [scheduleId]
    );
    
    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Schedule with ID ${id} not found`
      });
    }
    
    // Delete the schedule entry
    await db.client.query(
      'DELETE FROM schedules WHERE id = $1',
      [scheduleId]
    );
    
    // Return 204 No Content for successful deletion
    res.status(204).send();
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete schedule',
      details: error.message
    });
  }
});

/**
 * Get all sessions for admin management
 * GET /api/v1/admin/sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.*,
        COUNT(DISTINCT u.id) as user_count
      FROM 
        sessions s
      LEFT JOIN
        schedules sch ON s.session_code = sch.session_code
      LEFT JOIN
        users u ON sch.user_name = u.name
      GROUP BY
        s.id, s.session_code, s.created_at, s.expires_at
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

module.exports = router;
