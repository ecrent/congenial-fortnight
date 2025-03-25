/**
 * Simplified Database Configuration Module
 */
const { Pool } = require('pg');
require('dotenv').config();

// Load test environment if needed
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: './.env.test' });
}

// Query timeout settings
const DEFAULT_QUERY_TIMEOUT = parseInt(process.env.DB_QUERY_TIMEOUT || 5000);
const CRITICAL_QUERY_TIMEOUT = parseInt(process.env.DB_CRITICAL_TIMEOUT || 10000);
const MAX_CRITICAL_RETRIES = parseInt(process.env.DB_MAX_RETRIES || 3);

// Create database pool
let pool;
try {
  // Ensure DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL not found in environment variables!');
    process.exit(1);
  }

  // Create pool config
  const config = {
    connectionString: process.env.DATABASE_URL,
    keepAlive: true,
    max: parseInt(process.env.DB_POOL_MAX || 20),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || 3000),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || 3000),
    // Add SSL for production
    ...(process.env.NODE_ENV === 'production' && {
      ssl: { rejectUnauthorized: false }
    })
  };

  // Create the pool
  pool = new Pool(config);
  
  // Validate connection
  pool.query('SELECT 1')
    .then(() => console.log('✅ Database connection validated'))
    .catch(err => console.error('❌ Database connection failed:', err.message));
} catch (err) {
  console.error('Error creating database pool:', err.message);
  process.exit(1);
}

// Basic error handler for connection issues
pool.on('error', (err, client) => {
  console.error('Unexpected database error:', err);
  if (client) client.release(true);
});

/**
 * Execute a database query with unified options for timeout and retry
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {Object} options - Query options
 * @returns {Promise} - Query result
 */
async function executeQuery(text, params = [], options = {}) {
  const { 
    timeout = DEFAULT_QUERY_TIMEOUT,
    critical = false,
    maxRetries = critical ? MAX_CRITICAL_RETRIES : 1
  } = options;
  
  let lastError;
  let client;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      client = await pool.connect();
      await client.query(`SET statement_timeout TO ${timeout}`);
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      lastError = error;
      
      // Add context to timeout errors
      if (error.message?.includes('statement timeout')) {
        error.code = critical ? 'CRITICAL_QUERY_TIMEOUT' : 'QUERY_TIMEOUT';
        error.message = `Query timed out after ${timeout}ms`;
      }
      
      // Only log and retry for critical queries after first attempt
      if (critical && attempt < maxRetries) {
        const delayMs = 100 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        break; // Don't retry non-critical queries
      }
    } finally {
      if (client) {
        try { await client.query('RESET statement_timeout'); } 
        catch (err) { /* ignore reset errors */ }
        client.release();
      }
    }
  }
  
  throw lastError;
}

// Public API
module.exports = {
  // Standard query for non-critical operations
  query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => 
    executeQuery(text, params, { timeout }),
  
  // Critical query client for operations that need reliability
  client: {
    query: (text, params, timeout = CRITICAL_QUERY_TIMEOUT) => 
      executeQuery(text, params, { timeout, critical: true }),
  },
  
  // Connection pool access
  pool,
  
  // Connection testing function
  testConnection: async () => {
    try {
      const result = await pool.query('SELECT current_user, current_database(), version()');
      return {
        success: true,
        user: result.rows[0].current_user,
        database: result.rows[0].current_database,
        version: result.rows[0].version,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};