const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const session = require('express-session');
const passport = require('passport');

// Import database configuration
const db = require('./config/database');

// Import Passport configuration (local strategy)
require('./auth/passport');

// Import routes
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');
const adminRoutes = require('./routes/admin'); // <-- added admin routes

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

// Setup sessions; secret ideally comes from env variable
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('somebody hit the home route');
});

// Mount routes - fixed to prevent overlapping route issues
app.use('/api/v1', sessionRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', scheduleRoutes);


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