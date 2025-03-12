const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Transaction support
const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Export functions to use in routes
module.exports = {
  // Simple query function
  query: (text, params) => pool.query(text, params),
  
  // Client with transaction support
  client: {
    query: (text, params) => pool.query(text, params),
    transaction
  },
  pool
};
