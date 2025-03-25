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
// Extended timeout for critical operations (login, register, etc.)
const CRITICAL_QUERY_TIMEOUT = parseInt(process.env.DB_CRITICAL_TIMEOUT || 10000);
// Maximum retries for critical operations
const MAX_CRITICAL_RETRIES = parseInt(process.env.DB_MAX_RETRIES || 3);

/**
 * Configure the connection pool based on environment variables
 * @returns {Object} The PostgreSQL pool configuration
 */
function createPoolConfig() {
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL not found in environment variables!');
    process.exit(1);
  }
  
  // Create basic config with connection string
  const config = {
    connectionString: process.env.DATABASE_URL,
    keepAlive: true,
    max: parseInt(process.env.DB_POOL_MAX || 20),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || 3000),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || 3000)
  };
  
  // Print connection info for debugging (masking password)
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`Connection info: ${url.protocol}//${url.username}:****@${url.hostname}:${url.port}${url.pathname}`);
  } catch (e) {
    console.log('Unable to parse DATABASE_URL for logging');
  }
  
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
        console.error('   Ensure your DATABASE_URL is correct.');
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
 * Execute a standard database query with basic timeout protection
 * Use for standard read operations where occasional failures are acceptable
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

/**
 * Execute a critical database query with enhanced reliability
 * Use for authentication, data writes, and operations requiring high reliability
 * Includes retry logic and extended timeout for important operations
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} timeout - Query timeout in milliseconds
 * @returns {Promise} - Query result
 */
async function criticalQueryWithRetry(text, params = [], timeout = CRITICAL_QUERY_TIMEOUT) {
  let lastError;
  let client;
  
  // Try multiple times for critical operations
  for (let attempt = 1; attempt <= MAX_CRITICAL_RETRIES; attempt++) {
    try {
      // Get a client from the pool
      client = await pool.connect();
      
      // Set a longer timeout for critical operations
      await client.query(`SET statement_timeout TO ${timeout}`);
      
      // Execute the query
      const result = await client.query(text, params);
      
      // If successful, return the result
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Critical query attempt ${attempt}/${MAX_CRITICAL_RETRIES} failed:`, error.message);
      
      // Add more context to the error
      if (error.message && error.message.includes('statement timeout')) {
        error.message = `Critical query timed out after ${timeout}ms: ${text}`;
        error.code = 'CRITICAL_QUERY_TIMEOUT';
      }
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < MAX_CRITICAL_RETRIES) {
        const delayMs = 100 * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } finally {
      // Always release the client back to the pool
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
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
}

// Export functions and objects for use in the application
module.exports = {
  // Regular query - for standard data retrieval operations where occasional failures are acceptable
  // Examples: Reading session data, listing users, fetching non-critical data
  query: (text, params, timeout = DEFAULT_QUERY_TIMEOUT) => 
    queryWithTimeout(text, params, timeout),
  
  // Critical query client - for auth and critical operations that require high reliability
  // Examples: User login/registration, data writes, operations that must not fail
  client: {
    query: (text, params, timeout = CRITICAL_QUERY_TIMEOUT) => 
      criticalQueryWithRetry(text, params, timeout),
  },
  pool,
  DEFAULT_QUERY_TIMEOUT,
  CRITICAL_QUERY_TIMEOUT,
  testConnection: async () => {
    try {
      // Basic connectivity test
      const result = await pool.query('SELECT current_user, current_database(), version()');
      
      // Test permission to create tables (important for app functionality)
      try {
        await pool.query(`
          CREATE TEMPORARY TABLE connection_test (id SERIAL PRIMARY KEY, test_column TEXT);
          INSERT INTO connection_test (test_column) VALUES ('test');
          SELECT * FROM connection_test;
          DROP TABLE connection_test;
        `);
      } catch (permError) {
        return {
          success: false,
          partialSuccess: true,
          user: result.rows[0].current_user,
          database: result.rows[0].current_database,
          version: result.rows[0].version,
          error: `Connected but insufficient permissions: ${permError.message}`,
          timestamp: new Date().toISOString()
        };
      }
      
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
        code: err.code,
        timestamp: new Date().toISOString(),
        details: 'Check that your database credentials are correct and the database server is running'
      };
    }
  }
};