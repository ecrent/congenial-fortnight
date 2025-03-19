const express = require('express');
const cors = require('cors');
const app = express();

// Import database configuration
const db = require('./config/database');

// Import routes
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');
const optimalTimesRoutes = require('./routes/optimalTimes'); 
const adminRoutes = require('./routes/admin');
const debugRoutes = require('./routes/debug');

// Import rate limiting middleware
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// List of allowed origins - making this more permissive for troubleshooting
const allowedOrigins = [
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3001.app.github.dev',
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev',
  'https://production.d30jdlodeo6t5m.amplifyapp.com',
  'http://3.127.211.138',
  'http://localhost:3001'
];

// Log all origins for debugging
console.log('Allowed origins:', allowedOrigins);

// CORS pre-flight options handler - add this before the main CORS middleware
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('Received preflight request from:', origin);
  
  // Set CORS headers for preflight requests
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(204).end();
  } else {
    console.log('Origin rejected in preflight:', origin);
    res.status(403).end();
  }
});

// Improved CORS middleware with better logging
app.use(cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin rejected:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Add debug routes before rate limiting
app.use('/debug', debugRoutes);

// Apply rate limiters to specific route groups
app.use('/api/v1/users/login', authLimiter); // Strict limit for login
app.use('/api/v1/users/register', authLimiter); // Strict limit for registration
app.use('/api/v1', apiLimiter); // General limit for all other API routes

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('somebody hit the home route');
});

// Mount routes
app.use('/api/v1', sessionRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', scheduleRoutes);
app.use('/api/v1', optimalTimesRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    status: 'fail', 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start the server if this is the main module
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Server available at ${process.env.API_URL || 'http://localhost:'+port}`);
    console.log(`Accepting requests from ${process.env.CLIENT_URL || 'all origins'}`);
  });
}

module.exports = app;