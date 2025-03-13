const request = require('supertest');
const app = require('../index');

// Mock the database
jest.mock('../config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  client: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    transaction: jest.fn()
  },
  pool: {
    query: jest.fn()
  }
}));

describe('Basic Routes', () => {
  it('GET / should return a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });

  it('404 for non-existent route', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toEqual(404);
  });
});
