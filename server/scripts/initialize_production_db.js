/**
 * Database initialization script for production environment
 * 
 * Usage: NODE_ENV=production node ./scripts/initialize_production_db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

if (process.env.NODE_ENV !== 'production') {
  console.error('This script should be run in production mode. Set NODE_ENV=production');
  process.exit(1);
}

// Load production env variables
require('dotenv').config({ path: path.join(__dirname, './.env') });

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Initialize pool with production connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Add PostgreSQL 17.4 compatibility settings
  keepAlive: true,
  idle_in_transaction_session_timeout: 20000, // 10 seconds
  application_name: 'freetimefinder_init'
});

// Read schema file
const schemaPath = path.join(__dirname, '../db/db_init.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function initializeDatabase() {
  console.log('Initializing production database...');
  
  try {
    const client = await pool.connect();
    console.log('Connected to database. Running schema initialization...');
    
    // Execute schema
    await client.query(schema);
    
    console.log('Database initialization complete!');
    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
