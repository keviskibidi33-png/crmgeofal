// tests/projectWhatsappNotice.test.js
const request = require('supertest');
const app = require('../index');

describe('Project Whatsapp Notices API', () => {
  it('debe rechazar crear aviso sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/project-whatsapp-notices')
      .send({});
    expect([400,401,403]).toContain(res.statusCode); // Puede requerir auth
  });
});
