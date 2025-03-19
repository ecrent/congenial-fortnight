const express = require('express');
const router = express.Router();

// Simple health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    cors: {
      origin: req.headers.origin || 'No origin',
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
});

// Request info endpoint
router.get('/request-info', (req, res) => {
  res.status(200).json({
    status: 'success',
    headers: req.headers,
    ip: req.ip,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
