const express = require('express');
const cors = require('cors');
const app = express();


// Import routes
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');
const optimalTimesRoutes = require('./routes/optimalTimes'); 
const adminRoutes = require('./routes/admin');

const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

app.use(express.json());

// List of allowed origins - making this more permissive for troubleshooting
const allowedOrigins = [
  'https://5p91cl5dx1.execute-api.eu-central-1.amazonaws.com',
  'https://production.d30jdlodeo6t5m.amplifyapp.com',
  'http://3.127.211.138',
  'http://localhost:3001'
];

// Log all origins for debugging
console.log('Allowed origins:', allowedOrigins);

// Unified CORS configuration for all requests (including preflight OPTIONS)
app.use(cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
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

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

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
    console.log(`Accepting requests from ${process.env.CLIENT_URL || 'allowed origins'}`);
  });
}

// Add a global error handler before module.exports
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

module.exports = app;