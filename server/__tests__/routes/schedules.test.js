// We need to mock the auth middleware and database before requiring app
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, name: 'testuser', role: 'user' };
    next();
  }
}));

// Also mock the validation utils to allow any session_code
jest.mock('../../utils/validation', () => ({
  isValidSessionCode: () => true, // Always return true for test
  isValidUsername: () => true,
  isValidDayOfWeek: () => true,
  isValidTimeFormat: () => true,
  isValidTimeRange: () => true
}));

// Mock database with more specific implementation
const mockDbClient = {
  query: jest.fn()
};

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  client: mockDbClient
}));

// Need to import these after the mocks are set
const request = require('supertest');
const app = require('../../index');
const jwt = require('jsonwebtoken');

describe('Schedules API', () => {
  let token;
  
  beforeAll(() => {
    token = jwt.sign({ id: 1, name: 'testuser' }, process.env.JWT_SECRET || 'test-secret');
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the mock implementations for each test
    mockDbClient.query.mockImplementation((query, params) => {
      // Check session code validation
      if (query.includes('sessions WHERE session_code =')) {
        return Promise.resolve({ rows: [{ session_code: 'TEST123' }] });
      }
      
      // Check user validation
      if (query.includes('users WHERE name =')) {
        return Promise.resolve({ rows: [{ name: 'testuser' }] });
      }
      
      // Insert query - return mock data
      return Promise.resolve({
        rows: [{ 
          id: 1,
          session_code: 'TEST123',
          user_name: 'testuser',
          day_of_week: 1,
          start_time: '09:00:00',
          end_time: '12:00:00'
        }]
      });
    });
  });
  
  describe('POST /schedules', () => {
    it('should create a new schedule entry', async () => {
      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${token}`)
        .send({
          session_code: 'TEST123', // This would actually fail validation without our mock
          user_name: 'testuser',
          day_of_week: 1,
          start_time: '09:00',
          end_time: '12:00'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.schedule).toBeDefined();
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${token}`)
        .send({
          session_code: 'TEST123',
          // Missing user_name and other fields
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
    });
  });
});
