/**
 * Simple authentication service for session-based authentication
 */
const db = require('../config/database');

/**
 * Authenticate a user based on session code and user ID
 * @param {string} sessionCode - The session code
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - The authenticated user
 */
const authenticateUser = async (sessionCode, userId) => {
  // Get session by code
  const sessionResult = await db.query(
    'SELECT id FROM sessions WHERE session_code = $1 AND expires_at > NOW()',
    [sessionCode]
  );
  
  if (sessionResult.rows.length === 0) {
    const error = new Error('Invalid or expired session');
    error.statusCode = 401;
    throw error;
  }
  
  const sessionId = sessionResult.rows[0].id;
  
  // Verify user belongs to session
  const userResult = await db.query(
    'SELECT * FROM users WHERE id = $1 AND session_id = $2',
    [userId, sessionId]
  );
  
  if (userResult.rows.length === 0) {
    const error = new Error('User not found or does not belong to this session');
    error.statusCode = 401;
    throw error;
  }
  
  return userResult.rows[0];
};

/**
 * Create user authentication token (simple version without JWTs)
 * @param {Object} user - The user object
 * @param {string} sessionCode - The session code
 * @returns {Object} - Auth info with session code and user ID
 */
const createAuthInfo = (user, sessionCode) => {
  return {
    userId: user.id,
    userName: user.name,
    sessionCode,
    isReady: user.is_ready
  };
};

module.exports = {
  authenticateUser,
  createAuthInfo
};
