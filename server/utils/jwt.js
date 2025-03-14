const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get JWT secret from environment or use fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'meetingtimefinder-dev-secret-key';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate an access token for a user
 * @param {Object} user - The user object
 * @returns {String} JWT token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      name: user.name,
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate a refresh token for a user
 * @param {Object} user - The user object
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id }, 
    JWT_SECRET, 
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Verify a JWT token
 * @param {String} token - The token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
