const request = require('supertest');
const app = require('../index');
const db = require('../config/database');

describe('Session Routes', () => {
  let testSession;
  
  afterAll(async () => {
    await db.pool.end();
  });

  it('should create a new session with valid session code', async () => {
    const res = await request(app).post('/api/v1/sessions');
    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.session).toHaveProperty('id');
    expect(res.body.data.session).toHaveProperty('session_code');
    // Session code should be 8 characters
    expect(res.body.data.session.session_code.length).toEqual(8);
    
    testSession = res.body.data.session;
  });

  it('should retrieve a session by code', async () => {
    if (!testSession) {
      throw new Error('Test session not created in previous test');
    }
    
    const res = await request(app).get(`/api/v1/sessions/${testSession.session_code}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.session.id).toEqual(testSession.id);
  });

  it('should return 404 for non-existent session code', async () => {
    const res = await request(app).get('/api/v1/sessions/NONEXIST');
    expect(res.statusCode).toEqual(404);
    expect(res.body.status).toEqual('fail');
  });
});
