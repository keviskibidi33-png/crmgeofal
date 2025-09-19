// tests/projectHistory.test.js
const request = require('supertest');
const app = require('../index');

describe('Project History API', () => {
  it('debe rechazar agregar historial sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/project-history')
      .send({});
    expect([400,401,403]).toContain(res.statusCode); // Puede requerir auth
  });
});
