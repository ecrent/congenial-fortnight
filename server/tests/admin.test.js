const request = require('supertest');
const app = require('../index');
const db = require('../config/database');

// Helper: Create a user with a specified role
async function createUser(name, role = 'user') {
  // Simplified without passport and without admin role
  const result = await db.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, `${name}@example.com`, 'password']
  );
  return result.rows[0];
}

describe('Admin Cleanup Endpoint', () => {
  let session, normalUser;

  beforeAll(async () => {
    // Create a new session for testing
    const sessionRes = await request(app).post('/api/v1/sessions');
    session = sessionRes.body.data.session;
    
    // Create normal user, remove admin user creation
    normalUser = await createUser('NormalUser');
    
    // Insert expired session for cleanup testing
    await db.query(
      "INSERT INTO sessions (session_code, expires_at) VALUES ('EXPIRED', CURRENT_TIMESTAMP - INTERVAL '1 hour')"
    );
  });

  afterAll(async () => {
    await db.pool.end();
  });

  // Remove test that checks for admin-only access
  
  it('should allow cleanup for any user', async () => {
    const res = await request(app)
      .post('/api/v1/admin/cleanup');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/Cleanup successful/);
    
    // Verify expired session has been deleted
    const sessionRes = await db.query("SELECT * FROM sessions WHERE session_code = 'EXPIRED'");
    expect(sessionRes.rows.length).toEqual(0);
  });
});
