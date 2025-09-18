const pool = require('../config/db');

const Project = {
  async getAllByUser(user, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let data, total;
    if (user.role === 'jefa_comercial' || user.role === 'jefe_laboratorio') {
      data = await pool.query('SELECT * FROM projects ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
      total = await pool.query('SELECT COUNT(*) FROM projects');
    } else if (user.role === 'vendedor_comercial') {
      data = await pool.query('SELECT * FROM projects WHERE vendedor_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]);
      total = await pool.query('SELECT COUNT(*) FROM projects WHERE vendedor_id = $1', [user.id]);
    } else if (user.role === 'usuario_laboratorio') {
      data = await pool.query('SELECT * FROM projects WHERE laboratorio_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]);
      total = await pool.query('SELECT COUNT(*) FROM projects WHERE laboratorio_id = $1', [user.id]);
    } else {
      return { rows: [], total: 0 };
    }
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id, user) {
    // Solo acceso si el usuario tiene permiso
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = res.rows[0];
    if (!project) return null;
    if (
      user.role === 'jefa_comercial' ||
      user.role === 'jefe_laboratorio' ||
      (user.role === 'vendedor_comercial' && project.vendedor_id === user.id) ||
      (user.role === 'usuario_laboratorio' && project.laboratorio_id === user.id)
    ) {
      return project;
    }
    return null;
  },
  async create({ company_id, name, location, vendedor_id, laboratorio_id }) {
    const res = await pool.query(
      'INSERT INTO projects (company_id, name, location, vendedor_id, laboratorio_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [company_id, name, location, vendedor_id, laboratorio_id]
    );
    return res.rows[0];
  },
  async update(id, { name, location }, user) {
    // Solo el vendedor asignado o jefa comercial puede editar
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = res.rows[0];
    if (!project) return null;
    if (
      user.role === 'jefa_comercial' ||
      (user.role === 'vendedor_comercial' && project.vendedor_id === user.id)
    ) {
      const updated = await pool.query(
        'UPDATE projects SET name = $1, location = $2 WHERE id = $3 RETURNING *',
        [name, location, id]
      );
      return updated.rows[0];
    }
    return null;
  },
  async delete(id, user) {
    // Solo jefa comercial puede eliminar
    if (user.role !== 'jefa_comercial') return false;
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return true;
  },
};

module.exports = Project;
