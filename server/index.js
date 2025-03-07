const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
// Import database configuration
const db = require('./config/database');

// Import routes
const sessionRoutes = require('./routes/sessions');
const timetableRoutes = require('./routes/timetables');
const scheduleItemRoutes = require('./routes/scheduleItems');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');

// List of allowed origins
const allowedOrigins = [
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3001.app.github.dev',
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev' // Add localhost for testing
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('somebody hit the home route');
});

// Mount routes
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/timetables', timetableRoutes);
// Mount scheduleItemRoutes as sub-routes of timetables
app.use('/api/v1/timetables', scheduleItemRoutes);
app.use('/api/v1/sessions', userRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/users', scheduleRoutes);
app.use('/api/v1', scheduleRoutes);

// Database test route directly in main app
app.get('/api/v1/db/test', async (req, res) => {
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

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    status: 'fail', 
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});