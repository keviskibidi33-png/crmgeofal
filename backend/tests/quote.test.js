// tests/quote.test.js
const request = require('supertest');
const app = require('../index');

describe('Quotes API', () => {
  it('debe rechazar crear cotización sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/quotes')
      .send({});
    expect(res.statusCode).toBe(400);
  });
});
