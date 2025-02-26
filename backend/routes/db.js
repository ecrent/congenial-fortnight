const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route to test database connection
router.get('/test-connection', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    res.status(200).json({
      status: 'success',
      message: 'Database connection established successfully',
      data: {
        timestamp: result.rows[0].current_time
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to the database',
      error: error.message
    });
  }
});

// Route to test timetables table
router.get('/timetables', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM timetables');
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        timetables: result.rows
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch timetables',
      error: error.message
    });
  }
});

module.exports = router;
