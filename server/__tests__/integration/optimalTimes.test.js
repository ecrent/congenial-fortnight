const request = require('supertest');
const app = require('../../index');
const db = require('../../config/database');
const jwt = require('jsonwebtoken');

// Mock auth middleware to pass authentication
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, name: 'testuser', role: 'user' };
    next();
  }
}));

describe('Optimal Times API Integration', () => {
  let token;
  let testSessionCode;
  
  beforeAll(async () => {
    // Setup - create test user, session and schedules
    token = jwt.sign({ id: 1, name: 'testuser' }, process.env.JWT_SECRET || 'test-secret');
    
    // Create a session
    const sessionResult = await db.client.query(
      'INSERT INTO sessions(session_code) VALUES($1) RETURNING *',
      ['TESTINT1']
    );
    testSessionCode = sessionResult.rows[0].session_code;
    
    // Create test users first (to satisfy foreign key constraint)
    await db.client.query(`
      INSERT INTO users(name, email, password, role) 
      VALUES 
        ('testuser1', 'test1@example.com', 'password', 'user'),
        ('testuser2', 'test2@example.com', 'password', 'user'),
        ('testuser3', 'test3@example.com', 'password', 'user')
      ON CONFLICT (name) DO NOTHING
    `);
    
    // Now create schedules with valid users
    await db.client.query(`
      INSERT INTO schedules(session_code, user_name, day_of_week, start_time, end_time)
      VALUES 
        ($1, 'testuser1', 1, '09:00', '12:00'),
        ($1, 'testuser2', 1, '10:00', '14:00'),
        ($1, 'testuser3', 1, '11:00', '13:00')
    `, [testSessionCode]);
  });
  
  afterAll(async () => {
    // Clean up test data in correct order (due to foreign key constraints)
    try {
      await db.client.query('DELETE FROM schedules WHERE session_code = $1', [testSessionCode]);
      await db.client.query('DELETE FROM sessions WHERE session_code = $1', [testSessionCode]);
      await db.client.query(`DELETE FROM users WHERE name IN ('testuser1', 'testuser2', 'testuser3')`);
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
    
    // Don't try to call db.end() as it doesn't exist
    // Connection pooling is managed by the database module
  });
  
  describe('GET /optimal-times/:sessionCode', () => {
    it('should calculate optimal meeting times', async () => {
      const response = await request(app)
        .get(`/api/v1/optimal-times/${testSessionCode}?duration=60`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.optimalTimes).toBeInstanceOf(Array);
      
      // The optimal time for the 3 users should be 11:00-12:00 on Monday
      const optimalTime = response.body.data.optimalTimes[0];
      expect(optimalTime.day_of_week).toBe(1);
      expect(optimalTime.start_time).toBe('11:00:00');
      expect(optimalTime.end_time).toBe('12:00:00');
      
      // Fix: use toEqual for type coercion or parse the string to number
      expect(Number(optimalTime.user_count)).toBe(3);
      // Alternatively:
      // expect(optimalTime.user_count).toEqual(3);
    });
  });
});
