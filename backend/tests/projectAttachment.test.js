// tests/projectAttachment.test.js
const request = require('supertest');
const app = require('../index');

describe('Project Attachments API', () => {
  it('debe rechazar adjuntar archivo sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/project-attachments')
      .send({});
    expect([400,401,403]).toContain(res.statusCode); // Puede requerir auth
  });
});
