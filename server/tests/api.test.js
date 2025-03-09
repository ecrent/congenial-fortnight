const request = require('supertest');
const app = require('../index');

let testSession, testUser;

beforeAll(async () => {
  // Create a new session
  const sessionRes = await request(app).post('/api/v1/sessions');
  testSession = sessionRes.body.data.session;

  // Create a new user for that session (using a unique name)
  const userRes = await request(app)
    .post(`/api/v1/users/session/${testSession.id}`)
    .send({ name: "Test User " + Date.now() });
  testUser = userRes.body.data.user;
});

describe('API Tests', () => {
  // Test root endpoint
  describe('GET /', () => {
    it('should return Hello World!', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('Hello World!');
    });
  });

  // Test sessions endpoint
  describe('GET /api/v1/sessions', () => {
    it('should fetch all active sessions', async () => {
      const res = await request(app).get('/api/v1/sessions');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      // ...existing expectations...
    });
  });


  describe('Users Endpoints', () => {
    // GET: fetch all users for a session using testSession.id
    it('should fetch all users for the test session', async () => {
      const res = await request(app).get(`/api/v1/users/session/${testSession.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      // ...additional expectations...
    });

    // POST: create a new user in the test session
    it('should create a new user for the test session', async () => {
      const newUserName = "Another Test User " + Date.now();
      const res = await request(app)
        .post(`/api/v1/users/session/${testSession.id}`)
        .send({ name: newUserName });
      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toHaveProperty('user');
    });

    // GET: fetch the created test user by id
    it('should fetch the test user by id', async () => {
      const res = await request(app).get(`/api/v1/users/${testUser.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toHaveProperty('user');
    });

    // PUT: update the test user ready status to true
    it('should update the test user ready status to true', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${testUser.id}/ready`)
        .send({ isReady: true });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.user).toHaveProperty('is_ready', true);
    });
  });

  describe('Schedules Endpoints', () => {
    // GET: fetch all schedules for the test user
    it('should fetch all schedules for the test user', async () => {
      const res = await request(app).get(`/api/v1/users/${testUser.id}/schedules`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      // ...additional expectations...
    });

    // POST: create a new schedule using a unique time (avoid conflict with seeded data)
    it('should add a new schedule for the test user without conflict', async () => {
      const scheduleData = { day_of_week: 2, start_time: '12:00', end_time: '13:00' };
      const res = await request(app)
        .post(`/api/v1/users/${testUser.id}/schedules`)
        .send(scheduleData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toHaveProperty('schedule');
    });

    // DELETE: remove an existing schedule by creating one first with unique times
    it('should delete an existing schedule for the test user', async () => {
      const scheduleData = { day_of_week: 3, start_time: '14:00', end_time: '15:00' };
      const createRes = await request(app)
        .post(`/api/v1/users/${testUser.id}/schedules`)
        .send(scheduleData);
      expect(createRes.statusCode).toEqual(201);
      const scheduleId = createRes.body.data.schedule.id;

      const deleteRes = await request(app).delete(`/api/v1/schedules/${scheduleId}`);
      expect(deleteRes.statusCode).toEqual(204);
    });

    // GET: calculate optimal meeting times for the test session
    it('should calculate optimal meeting times for the test session with duration 60', async () => {
      const res = await request(app)
        .get(`/api/v1/sessions/${testSession.id}/optimal-times?duration=60`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      // ...additional expectations...
    });
  });
});

afterAll(async () => {
  const db = require('../config/database');
  await db.pool.end();  // Closes open database connections.
});
