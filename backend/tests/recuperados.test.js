const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');

describe('GET /api/recuperados', () => {
  // Token de prueba para jefa_comercial
  const token = jwt.sign({ id: 1, role: 'jefa_comercial', email: 'admin@test.com' }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });

  it('debe devolver 200 y un array de empresas sin proyectos recientes', async () => {
    const res = await request(app)
      .get('/api/recuperados')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
  });

  it('debe rechazar sin token', async () => {
    await request(app)
      .get('/api/recuperados')
      .expect(401);
  });

  it('debe rechazar si el rol no es permitido', async () => {
    const token = jwt.sign({ id: 2, role: 'usuario_laboratorio', email: 'lab@test.com' }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });
    await request(app)
      .get('/api/recuperados')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
