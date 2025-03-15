const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Import database configuration
const db = require('./config/database');

// Import routes
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');
const optimalTimesRoutes = require('./routes/optimalTimes'); 
// Removed admin routes import

// Import rate limiting middleware
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
// Removed adminLimiter

// List of allowed origins
const allowedOrigins = [
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3001.app.github.dev',
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev'
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

// Apply rate limiters to specific route groups
app.use('/api/v1/users/login', authLimiter); // Strict limit for login
app.use('/api/v1/users/register', authLimiter); // Strict limit for registration
// Removed admin route limiter
app.use('/api/v1', apiLimiter); // General limit for all other API routes

// Mount routes
app.use('/api/v1', sessionRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', scheduleRoutes);
app.use('/api/v1', optimalTimesRoutes); 
// Removed admin routes

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    status: 'fail', 
    message: 'Route not found',
    path: req.originalUrl
  });
});

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}`);
  });
}

module.exports = app;