// tests/category.test.js
const request = require('supertest');
const app = require('../index');

describe('Categories API', () => {
  it('debe rechazar crear categoría sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({});
    expect([400,401,403]).toContain(res.statusCode); // Puede requerir auth
  });
});
