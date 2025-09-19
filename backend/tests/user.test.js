// tests/user.test.js
const request = require('supertest');
const app = require('../index');

describe('Users API', () => {
  it('debe rechazar crear usuario sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({});
    expect(res.statusCode).toBe(400);
  });
});
