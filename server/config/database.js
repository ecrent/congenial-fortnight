/**
 * Database Configuration Module
 * Provides a connection pool to PostgreSQL and query functions with timeout protection
 */
const { Pool } = require('pg');
require('dotenv').config();

// Configure environment variables based on the runtime environment
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: './.env.test' });
  console.log('Running in test environment');
}

// Default timeout for queries in milliseconds
const DEFAULT_QUERY_TIMEOUT = parseInt(process.env.DB_QUERY_TIMEOUT || 5000);

/**
 * Configure the connection pool based on environment variables
 * @returns {Object} The PostgreSQL pool configuration
 */
function createPoolConfig() {
  // Check for database configuration - either through URL or individual params
  if (!process.env.DATABASE_URL && !(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME)) {
    console.error('Error: Database connection information not found!');
    console.error('Please provide either DATABASE_URL or all of: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  }
  
  let config;
  
  // Priority to individual connection parameters if provided
  if(process.env.DATABASE_URL){
    config = {
      connectionString: process.env.DATABASE_URL
    };
    console.log('Using database connection string from DATABASE_URL');
    
    // Print connection info for debugging (masking password)
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`Connection info: ${url.protocol}//${url.username}:****@${url.hostname}:${url.port}${url.pathname}`);
    } catch (e) {
      console.log('Unable to parse DATABASE_URL for logging');
    }
  }
  
  // Common configuration
  config.keepAlive = true;
  config.max = parseInt(process.env.DB_POOL_MAX || 20);
  config.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT || 3000);
  config.connectionTimeoutMillis = parseInt(process.env.DB_CONNECTION_TIMEOUT || 3000);
  
  // Add SSL for production environments
  if (process.env.NODE_ENV === 'production') {
    config.ssl = {
      rejectUnauthorized: false // Consider setting to true with proper CA certificate
    };
  }
  
  console.log(`Database pool configured with max=${config.max} connections`);
  return config;
}

// Create and configure the connection pool
let pool;
try {
  pool = new Pool(createPoolConfig());
  
  // Validate connection immediately to catch authentication issues
  pool.query('SELECT 1')
    .then(() => console.log('✅ Database connection successfully validated'))
    .catch(err => {
      console.error('❌ Database connection validation failed!', err.message);
      if (err.message.includes('password authentication failed')) {
        console.error('💡 Authentication error detected. Please check your database credentials.');
        console.error('   Ensure your DB_USER and DB_PASSWORD (or DATABASE_URL) are correct.');
      }
    });
} catch (err) {
  console.error('Error creating database pool:', err.message);
  process.exit(1);
}

// Set up connection event handlers
pool.on('connect', () => {
  console.log(`Database connection established (active connections: ${pool.totalCount || 'unknown'})`);
});

pool.on('error', (err, client) => {
  console.error('Unexpected database connection error:', err);
  if (client) client.release(true);
});

/**
 * Execute a database query with timeout protection
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} timeout - Query timeout in milliseconds
 * @returns {Promise} - Query result
 */
async function queryWithTimeout(text, params = [], timeout = DEFAULT_QUERY_TIMEOUT) {
  let client;
  
  try {
    client = await pool.connect();
    
    // Set statement timeout for this specific query
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
    if (client) {
      try {
        await client.query('RESET statement_timeout');
      } catch (err) {
        console.error('Error resetting statement timeout:', err);
      } finally {
        client.release();
      }
    }
  }
}

// Export functions and objects for use in the application
module.exports = {
  query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => 
    queryWithTimeout(text, params, timeout),
  
  client: {
    query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => 
      queryWithTimeout(text, params, timeout),
  },
  pool,
  DEFAULT_QUERY_TIMEOUT
};