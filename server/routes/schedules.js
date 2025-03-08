const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Get all availability entries for a user
 * GET /api/v1/users/:userId/schedules
 */
router.get('/users/:userId/schedules', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${userId} not found`
      });
    }
    
    // Get all availability entries for this user
    const result = await db.query(
      'SELECT * FROM schedules WHERE user_id = $1 ORDER BY day_of_week, start_time',
      [userId]
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
 * Add an availability entry for a user
 * POST /api/v1/users/:userId/schedules
 */
router.post('/users/:userId/schedules', async (req, res) => {
  try {
    const { userId } = req.params;
    const { day_of_week, start_time, end_time } = req.body;
    
    // Check if user exists
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${userId} not found`
      });
    }
    
    // Create the availability entry
    const result = await db.query(
      'INSERT INTO schedules (user_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, day_of_week, start_time, end_time]
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
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM schedules WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Availability entry with ID ${id} not found`
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete availability',
      details: error.message
    });
  }
});

/**
 * Find optimal meeting times for a session
 * GET /api/v1/sessions/:sessionId/optimal-times
 * 
 * This endpoint analyzes all participants' availability
 * and finds the best meeting times based on the required duration
 */
router.get('/sessions/:sessionId/optimal-times', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration = 60 } = req.query; // Duration in minutes, default 60
    
    // Check if session exists
    const sessionCheck = await db.query(
      'SELECT id FROM sessions WHERE id = $1 AND expires_at > NOW()',
      [sessionId]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Meeting session with ID ${sessionId} not found or expired`
      });
    }
    
    // Get all participants in the meeting session
    const usersResult = await db.query(
      'SELECT id FROM users WHERE session_id = $1',
      [sessionId]
    );
    
    if (usersResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No participants found in this meeting session'
      });
    }
    
    // Find overlapping availability for all participants
    const result = await db.query(`
      WITH user_intervals AS (
        SELECT 
          u.id AS user_id, 
          s.day_of_week, 
          s.start_time, 
          s.end_time,
          (SELECT COUNT(*) FROM users WHERE session_id = $1) as total_users
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE u.session_id = $1
      ),
      time_slots AS (
        SELECT 
          day_of_week,
          start_time,
          end_time,
          COUNT(DISTINCT user_id) as user_count,
          total_users,
          EXTRACT(EPOCH FROM (end_time - start_time)) / 60 AS slot_duration
        FROM user_intervals
        GROUP BY day_of_week, start_time, end_time, total_users
        HAVING EXTRACT(EPOCH FROM (end_time - start_time)) / 60 >= $2
        ORDER BY 
          day_of_week, 
          user_count DESC, -- Prioritize slots with more participants
          slot_duration DESC -- Then prioritize longer slots
      )
      SELECT * FROM time_slots;
    `, [sessionId, duration]);
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        optimalTimes: result.rows
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to find optimal meeting times',
      details: error.message
    });
  }
});

module.exports = router;
