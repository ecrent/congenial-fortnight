// This file is loaded after Jest environment is set up, so afterAll is available here
const db = require('./config/database');

// Set a longer timeout for tests
jest.setTimeout(30000);

// Add a global beforeAll to prepare the test environment
beforeAll(() => {
  console.log('Setting up test environment');
});

// Global teardown to close database connections
afterAll(async () => {
  console.log('Tearing down test environment');
  
  // Try to close client connections if they exist
  if (db && db.client && typeof db.client.end === 'function') {
    try {
      await db.client.end();
      console.log('Database client connection closed');
    } catch (error) {
      console.error('Error closing database client connection:', error);
    }
  }
  
  // Try to close pool connections
  if (db && db.pool && typeof db.pool.end === 'function') {
    try {
      await db.pool.end();
      console.log('Database pool connection closed');
    } catch (error) {
      console.error('Error closing database pool connection:', error);
    }
  }
});
