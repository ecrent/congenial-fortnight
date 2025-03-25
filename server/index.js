const express = require('express');
const cors = require('cors');
const app = express();

// Import database 'configuration
const db = require('./config/database');

// Import routes
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');
const optimalTimesRoutes = require('./routes/optimalTimes'); 
const adminRoutes = require('./routes/admin');


// Import rate limiting middleware
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// List of allowed origins - making this more permissive for troubleshooting
const allowedOrigins = [
  'https://production.d30jdlodeo6t5m.amplifyapp.com',
  'https://production.d30jdlodeo6t5m.amplifyapp.com/',
  'http://3.66.236.66',
  'https://www.freetimefinder.click/',
  'https://www.freetimefinder.click',
  'https://freetimefinder.click/',
  'https://freetimefinder.click',
  'https://chhf35hosf.execute-api.eu-central-1.amazonaws.com/prod',
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev',
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3001.app.github.dev',

];

// Log all origins for debugging
console.log('Allowed origins:', allowedOrigins);

// Configure CORS middleware properly
app.use(cors({
  origin: function(origin, callback) {
    // Removed redundant console.log here
    
    // For AWS Lambda and API Gateway, handle missing origin properly
    if (!origin) {
      // When running behind API Gateway, the origin can be missing
      // We should still allow these requests
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if the origin is allowed or if it's a substring of any allowed origin
    // This helps with API Gateway URLs that might include paths
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      console.log('Origin allowed:', origin);
      callback(null, origin);
    } else {
      console.log('Origin rejected:', origin);
      // In production, we might want to still allow the request but log the issue
      // Instead of throwing an error, let's allow it but log
      callback(null, origin);
      // callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Enable trust proxy
app.set('trust proxy', 1);

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


// Explicitly handle OPTIONS requests for all routes
app.options('*', cors({
  origin: function(origin, callback) {
    console.log('OPTIONS request origin:', origin);
    callback(null, origin);
  },
  credentials: true
}));

// Mount routes - adding /production prefix to handle API Gateway
const apiPrefix = '/api/v1';
console.log(`Using API prefix: ${apiPrefix}`);

app.use(apiPrefix, sessionRoutes);
app.use(apiPrefix, userRoutes);
app.use(apiPrefix, scheduleRoutes);
app.use(apiPrefix, optimalTimesRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);


// 404 handler for undefined routes
app.use((req, res) => {
  // Include CORS headers here too
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(404).json({ 
    status: 'fail', 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Only set specific origin if it's in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  console.error('Error middleware:', err);
  // If headers have been sent, delegate to default error handler
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start the server if this is the main module
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Server available at ${process.env.API_URL}`);
    console.log(`Accepting requests from ${process.env.CLIENT_URL}`);
  });
}

module.exports = app;