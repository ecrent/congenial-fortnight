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
const adminRoutes = require('./routes/admin'); // Add admin routes

// Import rate limiting middleware
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// List of allowed origins
const allowedOrigins = [
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3001.app.github.dev',
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev'
];

// Use the cors middleware properly instead of manual implementation
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
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
app.use('/api/v1/admin', adminRoutes); // Mount admin routes

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    status: 'fail', 
    message: 'Route not found',
    path: req.originalUrl
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}`);
  });
}

module.exports = app;