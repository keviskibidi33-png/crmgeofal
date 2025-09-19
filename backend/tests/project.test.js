// tests/project.test.js
const request = require('supertest');
const app = require('../index');

describe('Projects API', () => {
  it('debe rechazar crear proyecto sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({});
    expect([400,401,403]).toContain(res.statusCode); // Puede requerir auth
  });
});
