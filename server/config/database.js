const { Pool } = require('pg');
require('dotenv').config();

// Load test environment variables if in test mode
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: './.env.test' });
  console.log('Running in test environment');
}

// Default query timeout in milliseconds
const DEFAULT_QUERY_TIMEOUT = parseInt(process.env.DB_QUERY_TIMEOUT || 5000);

// Create a connection pool to the PostgreSQL database
let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL
  };
  console.log('Using database connection string from DATABASE_URL');
  
  // Add support for newer protocol version in PostgreSQL 17.4
  poolConfig.keepAlive = true;
  
  // Enable extended result metadata for PostgreSQL 17.4 enhanced diagnostics
  poolConfig.query_timeout = DEFAULT_QUERY_TIMEOUT;
} else {
  console.error('DATABASE_URL environment variable not found!');
  process.exit(1); // Exit if no connection string is available
}

// Fix the 8-connection limit issue
poolConfig.max = parseInt(process.env.DB_POOL_MAX || 20); // Explicitly set higher than 8
poolConfig.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT || 3000); // 3 seconds
poolConfig.connectionTimeoutMillis = parseInt(process.env.DB_CONNECTION_TIMEOUT || 3000); // 3 seconds

// Log connection configuration
console.log(`Database pool configured with max=${poolConfig.max} connections`);

const pool = new Pool(poolConfig);

// Connection tracking
pool.on('connect', () => {
  console.log(`Database connection established (active connections: ${pool.totalCount || 'unknown'})`);
});

pool.on('error', (err, client) => {
  console.error('Unexpected database connection error:', err);
  if (client) client.release(true);
});

/**
 * Execute a query with timeout protection
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} timeout - Query timeout in milliseconds
 * @returns {Promise} - Query result
 */
const queryWithTimeout = async (text, params = [], timeout = DEFAULT_QUERY_TIMEOUT) => {
  const client = await pool.connect();
  
  try {
    // Set statement timeout for this query
    await client.query(`SET statement_timeout TO ${timeout}`);
    
    // Execute the query with parameters
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    // Enhance error message for timeout conditions
    if (error.message && error.message.includes('statement timeout')) {
      error.message = `Query timed out after ${timeout}ms: ${text}`;
      error.code = 'QUERY_TIMEOUT';
    }
    throw error;
  } finally {
    // Always reset statement timeout and release client back to pool
    try {
      await client.query('RESET statement_timeout');
    } finally {
      client.release();
    }
  }
};

// Export functions to use in routes
module.exports = {
  // Main query function
  query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => queryWithTimeout(text, params, timeout),
  
  // For API consistency, but both point to the same implementation
  client: {
    query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => queryWithTimeout(text, params, timeout),
  },
  pool,
  DEFAULT_QUERY_TIMEOUT
};
