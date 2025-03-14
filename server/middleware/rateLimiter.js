const rateLimit = require('express-rate-limit');

// Base configuration for rate limiting
const baseConfig = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
    details: 'Rate limit exceeded'
  },
  // Skip rate limiting in test environment
  skip: () => process.env.NODE_ENV === 'test',
};

// General API rate limiter - more permissive
// Allows 100 requests per minute per IP
const apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Auth endpoints rate limiter - more restrictive
// Allows 5 login attempts per minute per IP
const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later.',
    details: 'Rate limit exceeded'
  },
});

// Admin endpoints rate limiter
// Allows 30 requests per minute per IP
const adminLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 30 requests per windowMs
});

module.exports = {
  apiLimiter,
  authLimiter,
  adminLimiter
};
