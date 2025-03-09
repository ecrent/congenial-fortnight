const request = require('supertest');
const app = require('../index');
const db = require('../config/database');

describe('End-to-End User Flow', () => {
  let session, user1, user2, schedule1, schedule2;
  
  afterAll(async () => {
    await db.pool.end();
  });

  it('should create a new session', async () => {
    const res = await request(app).post('/api/v1/sessions');
    expect(res.statusCode).toEqual(201);
    session = res.body.data.session;
  });

  it('should add first user to session', async () => {
    const res = await request(app)
      .post(`/api/v1/users/session/${session.id}`)
      .send({ name: 'Test User 1' });
    expect(res.statusCode).toEqual(201);
    user1 = res.body.data.user;
  });
  
  it('should add second user to session', async () => {
    const res = await request(app)
      .post(`/api/v1/users/session/${session.id}`)
      .send({ name: 'Test User 2' });
    expect(res.statusCode).toEqual(201);
    user2 = res.body.data.user;
  });

  it('should add schedule for first user', async () => {
    const scheduleData = { day_of_week: 1, start_time: '10:00', end_time: '12:00' };
    const res = await request(app)
      .post(`/api/v1/users/${user1.id}/schedules`)
      .send(scheduleData);
    expect(res.statusCode).toEqual(201);
    schedule1 = res.body.data.schedule;
  });

  it('should add overlapping schedule for second user', async () => {
    // Overlapping with first user's schedule
    const scheduleData = { day_of_week: 1, start_time: '11:00', end_time: '13:00' };
    const res = await request(app)
      .post(`/api/v1/users/${user2.id}/schedules`)
      .send(scheduleData);
    expect(res.statusCode).toEqual(201);
    schedule2 = res.body.data.schedule;
  });

  it('should mark both users as ready', async () => {
    await request(app)
      .put(`/api/v1/users/${user1.id}/ready`)
      .send({ isReady: true });
    
    const res = await request(app)
      .put(`/api/v1/users/${user2.id}/ready`)
      .send({ isReady: true });
    expect(res.statusCode).toEqual(200);
  });

  it('should calculate optimal meeting time', async () => {
    const res = await request(app).get(`/api/v1/sessions/${session.id}/optimal-times?duration=30`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.optimalTimes.length).toBeGreaterThan(0);
    // Should find the overlapping time slot (11:00-12:00)
    const hasOverlap = res.body.data.optimalTimes.some(time => 
      time.day_of_week == 1 && 
      time.start_time <= '11:00:00' && 
      time.end_time >= '12:00:00'
    );
    expect(hasOverlap).toBeTruthy();
  });
});
