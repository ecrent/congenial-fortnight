const { Pool } = require('pg');
require('dotenv').config();

// Load test environment variables if in test mode
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: './.env.test' });
  console.log('Running in test environment');
  console.log(`DB Connection: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
}

// Default query timeout in milliseconds (5 seconds)
const DEFAULT_QUERY_TIMEOUT = parseInt(process.env.DB_QUERY_TIMEOUT || 5000);

// Create a connection pool to the PostgreSQL database
let poolConfig;

// In production, use the DATABASE_URL connection string
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for some hosted services (e.g., AWS RDS)
    }
  };
  console.log('Using production database connection string');
} else {
  // For development or when individual parameters are provided
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
  };
}

// Add connection pool settings regardless of connection method
poolConfig.max = parseInt(process.env.DB_POOL_MAX || 20);
poolConfig.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT || 30000);
poolConfig.connectionTimeoutMillis = parseInt(process.env.DB_CONNECTION_TIMEOUT || 10000);

const pool = new Pool(poolConfig);

// Log connection status
pool.on('connect', () => {
  console.log(`Connected to PostgreSQL database at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

/**
 * Execute a query with timeout protection
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} timeout - Query timeout in milliseconds
 * @returns {Promise} - Query result
 */
const queryWithTimeout = async (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => {
  const client = await pool.connect();
  
  try {
    // Set statement timeout for this query (fix: no quotes around the value)
    await client.query(`SET statement_timeout TO ${timeout}`);
    
    // Add query configuration with rowMode
    const query = {
      text: text,
      values: params
    };
    
    // Execute the query with parameters
    const result = await client.query(query);
    return result;
  } catch (error) {
    // Enhance error message for timeout conditions
    if (error.message && error.message.includes('statement timeout')) {
      error.message = `Query timed out after ${timeout}ms: ${text}`;
      error.code = 'QUERY_TIMEOUT';
    }
    throw error;
  } finally {
    // Reset statement timeout and release client back to pool
    try {
      await client.query('RESET statement_timeout');
    } finally {
      client.release();
    }
  }
};

// Transaction support with timeout
const transaction = async (callback, timeout = DEFAULT_QUERY_TIMEOUT) => {
  const client = await pool.connect();
  
  try {
    // Set statement timeout for this transaction
    await client.query(`SET statement_timeout TO ${timeout}`);
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    // Enhance error message for timeout conditions
    if (error.message && error.message.includes('statement timeout')) {
      error.message = `Transaction timed out after ${timeout}ms`;
      error.code = 'QUERY_TIMEOUT';
    }
    throw error;
  } finally {
    // Reset statement timeout and release client
    try {
      await client.query('RESET statement_timeout');
    } finally {
      client.release();
    }
  }
};

// Export functions to use in routes
module.exports = {
  // Simple query function with timeout
  query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => queryWithTimeout(text, params, timeout),
  
  // Client with transaction support
  client: {
    query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => queryWithTimeout(text, params, timeout),
    transaction
  },
  pool,
  DEFAULT_QUERY_TIMEOUT
};
