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

// Export functions to use in routes
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
