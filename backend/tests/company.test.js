// tests/company.test.js
const request = require('supertest');
const app = require('../index');

describe('Companies API', () => {
  it('debe rechazar crear empresa sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/companies')
      .send({});
    expect([400,401,403]).toContain(res.statusCode); // Puede requerir auth
  });
});
