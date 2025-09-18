// tests/lead.test.js
const request = require('supertest');
const app = require('../index');

describe('Leads API', () => {
  it('debe rechazar crear lead sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
