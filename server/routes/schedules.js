const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Get all schedule entries for a user
 * GET /api/v1/users/:userId/schedules
 */
router.get('/:userId/schedules', async (req, res) => {
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
    
    // Get all schedule entries for this user
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
      message: 'Failed to fetch schedules',
      details: error.message
    });
  }
});

/**
 * Add a schedule entry for a user
 * POST /api/v1/users/:userId/schedules
 */
router.post('/:userId/schedules', async (req, res) => {
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
    
    // Create the schedule entry
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
        message: 'This time slot overlaps with an existing one',
        details: error.detail
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to create schedule entry',
        details: error.message
      });
    }
  }
});

/**
 * Delete a schedule entry
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
        message: `Schedule entry with ID ${id} not found`
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
      message: 'Failed to delete schedule entry',
      details: error.message
    });
  }
});

/**
 * Calculate optimal meeting times for a session
 * GET /api/v1/sessions/:sessionId/optimal-times
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
        message: `Session with ID ${sessionId} not found or expired`
      });
    }
    
    // Get all users in the session
    const usersResult = await db.query(
      'SELECT id FROM users WHERE session_id = $1',
      [sessionId]
    );
    
    if (usersResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No users found in this session'
      });
    }
    
    // Find overlapping availability for all users
    // This is a simplistic version; a more sophisticated approach may be needed
    const result = await db.query(`
      WITH user_intervals AS (
        SELECT u.id AS user_id, s.day_of_week, s.start_time, s.end_time
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE u.session_id = $1
      ),
      pair_intersections AS (
        SELECT 
          ui1.day_of_week,
          GREATEST(ui1.start_time, ui2.start_time) AS common_start,
          LEAST(ui1.end_time, ui2.end_time) AS common_end,
          ui1.user_id AS user1,
          ui2.user_id AS user2
        FROM user_intervals ui1
        JOIN user_intervals ui2 
          ON ui1.day_of_week = ui2.day_of_week
         AND ui1.user_id < ui2.user_id
        WHERE LEAST(ui1.end_time, ui2.end_time) > GREATEST(ui1.start_time, ui2.start_time)
      )
      SELECT 
        day_of_week,
        common_start,
        common_end,
        EXTRACT(EPOCH FROM (common_end - common_start)) / 60 AS available_minutes
      FROM pair_intersections
      WHERE EXTRACT(EPOCH FROM (common_end - common_start)) / 60 >= $2
      ORDER BY day_of_week, common_start;
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
      message: 'Failed to calculate optimal meeting times',
      details: error.message
    });
  }
});

module.exports = router;
