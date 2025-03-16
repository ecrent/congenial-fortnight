const { authenticate } = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');

describe('Authentication Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // More specific mock of the database query
    // This needs to match exactly what the middleware expects
    db.query = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        rows: [{ 
          id: 1, 
          name: 'testuser', 
          role: 'user',
          email: 'test@example.com'
        }]
      });
    });
  });
  
  it('should return 401 if no token provided', async () => {
    await authenticate(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'fail'
    }));
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should authenticate user with valid token', async () => {
    const token = jwt.sign({ id: 1, name: 'testuser' }, process.env.JWT_SECRET || 'test-secret');
    req.headers.authorization = `Bearer ${token}`;
    
    // Mock the database connection where the middleware looks for it
    const mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [{ 
          id: 1, 
          name: 'testuser', 
          role: 'user',
          email: 'test@example.com'
        }]
      })
    };
    db.client = mockClient;
    
    // Call authenticate and wait for it to complete
    await authenticate(req, res, next);
    
    // Verify the user was set correctly
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
    expect(next).toHaveBeenCalled();
  });
});
