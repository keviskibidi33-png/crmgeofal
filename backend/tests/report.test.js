// tests/report.test.js
const request = require('supertest');
const app = require('../index');

describe('Reports API', () => {
  it('debe requerir autenticación para reportes', async () => {
    const res = await request(app)
      .get('/api/reports/ventas-por-vendedor');
    expect([401,403]).toContain(res.statusCode);
  });
});
