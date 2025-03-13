const express = require('express');
const router = express.Router();
const db = require('../config/database');

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
             AND day_of_week = s.day_of_week) AS total_users,
          ARRAY_AGG(DISTINCT user_name) AS available_users
        FROM schedules s
        WHERE session_code = $1
        GROUP BY day_of_week
      )
      SELECT
        day_of_week,
        common_start as start_time,
        common_end as end_time,
        user_count,
        total_users,
        available_users,
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
