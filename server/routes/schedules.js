const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Get all availability entries for a user
 * GET /api/v1/schedules/user/:name
 */
router.get('/schedules/user/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Check if user exists
    const userCheck = await db.query(
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
    const result = await db.query(
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
router.post('/schedules', async (req, res) => {
  try {
    const { session_code, user_name, day_of_week, start_time, end_time } = req.body;
    
    // Check if session exists
    const sessionCheck = await db.query(
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
    const userCheck = await db.query(
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
    const result = await db.query(
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
 * GET /api/v1/optimal-times/:sessionCode
 */
router.get('/optimal-times/:sessionCode', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const { duration = 60 } = req.query; // Duration in minutes, and optional notify flag
    
    // Check if session exists
    const sessionCheck = await db.query(
      'SELECT session_code FROM sessions WHERE session_code = $1 AND expires_at > NOW()',
      [sessionCode]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Session with code ${sessionCode} not found or expired`
      });
    }
    
    // Find overlapping availability for all participants
    const result = await db.query(`
      WITH day_intervals AS (
        SELECT 
          day_of_week,
          MAX(start_time) AS common_start,
          MIN(end_time) AS common_end,
          COUNT(DISTINCT user_name) AS user_count,
          (SELECT COUNT(DISTINCT user_name) 
           FROM schedules 
           WHERE session_code = $1 
             AND day_of_week = s.day_of_week) AS total_users
        FROM schedules s
        WHERE session_code = $1
        GROUP BY day_of_week
      )
      SELECT
        day_of_week,
        common_start,
        common_end,
        EXTRACT(EPOCH FROM (common_end - common_start)) / 60 AS duration
      FROM day_intervals
      WHERE common_end > common_start
        AND EXTRACT(EPOCH FROM (common_end - common_start)) / 60 >= $2
        AND user_count = total_users
      ORDER BY
        day_of_week,
        duration DESC;
    `, [sessionCode, duration]);
    
    const optimalTimes = result.rows;
    

    res.status(200).json({
      status: 'success',
      results: optimalTimes.length,
      data: {
        optimalTimes
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
