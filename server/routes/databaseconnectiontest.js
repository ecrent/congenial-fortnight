const express = require('express');
const router = express.Router();
const db = require('../config/database');

app.get('/db/test', async (req, res) => {
    try {
      const result = await db.query('SELECT NOW()');
      res.status(200).json({
        status: 'success',
        message: 'Database connection successful!',
        timestamp: result.rows[0].now
      });
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({
        status: 'error', 
        message: 'Database connection failed',
        details: error.message
      });
    }
  });

  module.exports = router;