const db = require('../../config/database');

describe('Database Integrity Tests', () => {
  // Connect to test database before tests
  beforeAll(async () => {
    // Switch to test database
  });
  
  // Note: No need to add afterAll here as it's now in the global jest.setupAfterEnv.js file
  
  it('should enforce foreign key constraints', async () => {
    // Try to insert a schedule with non-existent session code
    try {
      await db.client.query(`
        INSERT INTO schedules(session_code, user_name, day_of_week, start_time, end_time)
        VALUES ('NONEXIST', 'testuser', 1, '09:00', '12:00')
      `);
      // If we reach here, constraint failed
      expect(true).toBe(false); // This should not execute
    } catch (error) {
      // Should get a foreign key violation
      expect(error.code).toBe('23503'); // Foreign key violation code
    }
  });
  
  it('should enforce time range constraints', async () => {
    // Create a test session
    const sessionResult = await db.client.query(
      'INSERT INTO sessions(session_code) VALUES($1) RETURNING *',
      ['TESTCON1']
    );
    
    try {
      // Try to insert invalid time range (end before start)
      await db.client.query(`
        INSERT INTO schedules(session_code, user_name, day_of_week, start_time, end_time)
        VALUES ($1, 'testuser', 1, '12:00', '09:00')
      `, [sessionResult.rows[0].session_code]);
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Should get a check constraint violation
      expect(error.code).toBe('23514'); // Check constraint violation
    }
    
    // Clean up
    await db.client.query('DELETE FROM sessions WHERE session_code = $1', 
      [sessionResult.rows[0].session_code]);
  });
});
