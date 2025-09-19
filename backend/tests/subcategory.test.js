// tests/subcategory.test.js
const request = require('supertest');
const app = require('../index');

describe('Subcategories API', () => {
  it('debe rechazar crear subcategoría sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/subcategories')
      .send({});
    expect([400,401,403]).toContain(res.statusCode); // Puede requerir auth
  });
});
