const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { 
  isValidTimeFormat, 
  isValidDayOfWeek, 
  isValidTimeRange, 
  isValidSessionCode, 
  isValidUsername 
} = require('../utils/validation');

/**
 * Get all availability entries for a user
 * GET /api/v1/schedules/user/:name
 */
router.get('/schedules/user/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    
    // Validate username
    if (!isValidUsername(name)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid username format'
      });
    }
    
    // Check if user exists
    const userCheck = await db.client.query(
      'SELECT name FROM users WHERE name = $1',
      [name]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with name ${name} not found`
      });
    }
    
    // Get all availability entries for this user
    const result = await db.client.query(
      'SELECT * FROM schedules WHERE user_name = $1 ORDER BY day_of_week, start_time',
      [name]
    );
    
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
      message: 'Failed to fetch availability',
      details: error.message
    });
  }
});

/**
 * Add an availability entry for a user in a specific session
 * POST /api/v1/schedules
 */
router.post('/schedules', authenticate, async (req, res) => {
  try {
    const { session_code, user_name, day_of_week, start_time, end_time } = req.body;
    
    // Validate inputs
    if (!session_code || !user_name || day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required: session_code, user_name, day_of_week, start_time, end_time'
      });
    }
    
    // Validate session code
    if (!isValidSessionCode(session_code)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid session code format'
      });
    }
    
    // Validate username
    if (!isValidUsername(user_name)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid username format'
      });
    }
    
    // Validate day of week
    if (!isValidDayOfWeek(parseInt(day_of_week))) {
      return res.status(400).json({
        status: 'fail',
        message: 'Day of week must be a number between 0 and 6'
      });
    }
    
    // Validate time formats
    if (!isValidTimeFormat(start_time)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid start time format. Use HH:MM format.'
      });
    }
    
    if (!isValidTimeFormat(end_time)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid end time format. Use HH:MM format.'
      });
    }
    
    // Validate time range
    if (!isValidTimeRange(start_time, end_time)) {
      return res.status(400).json({
        status: 'fail',
        message: 'End time must be after start time'
      });
    }
    
    // Check if session exists
    const sessionCheck = await db.client.query(
      'SELECT session_code FROM sessions WHERE session_code = $1 AND expires_at > NOW()',
      [session_code]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Session with code ${session_code} not found or expired`
      });
    }
    
    // Check if user exists
    const userCheck = await db.client.query(
      'SELECT name FROM users WHERE name = $1',
      [user_name]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with name ${user_name} not found`
      });
    }
    
    // Create the availability entry
    const result = await db.client.query(
      'INSERT INTO schedules (session_code, user_name, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [session_code, user_name, day_of_week, start_time, end_time]
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        schedule: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        status: 'fail',
        message: 'This time slot overlaps with your existing availability',
        details: error.detail
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to add availability',
        details: error.message
      });
    }
  }
});

/**
 * Delete an availability entry
 * DELETE /api/v1/schedules/:id
 */
router.delete('/schedules/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    const scheduleId = parseInt(id);
    if (isNaN(scheduleId) || scheduleId <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid schedule ID'
      });
    }
    
    // Check if the schedule exists and belongs to the authenticated user
    const scheduleCheck = await db.client.query(
      'SELECT user_name FROM schedules WHERE id = $1',
      [scheduleId]
    );
    
    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Availability entry with ID ${id} not found`
      });
    }
    
    // Verify the user is deleting their own schedule
    if (scheduleCheck.rows[0].user_name !== req.user.name) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this availability entry'
      });
    }
    
    // Delete the schedule entry
    const result = await db.client.query(
      'DELETE FROM schedules WHERE id = $1 RETURNING id',
      [scheduleId]
    );
    
    // Send a 204 No Content response
    res.status(204).send();
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete availability',
      details: error.message
    });
  }
});

module.exports = router;
