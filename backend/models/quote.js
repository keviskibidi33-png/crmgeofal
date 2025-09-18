const pool = require('../config/db');

const Quote = {
  async getAllByProject(project_id, user, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM quotes WHERE project_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [project_id, limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM quotes WHERE project_id = $1', [project_id]);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ project_id, document_url, engineer_name, notes }) {
    const res = await pool.query(
      'INSERT INTO quotes (project_id, document_url, engineer_name, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, document_url, engineer_name, notes]
    );
    return res.rows[0];
  },
  async update(id, { document_url, engineer_name, notes }, user) {
    // Solo laboratorio asignado o jefe laboratorio puede editar
    const res = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    const quote = res.rows[0];
    if (!quote) return null;
    // Validación de permisos se puede mejorar según flujo
    const updated = await pool.query(
      'UPDATE quotes SET document_url = $1, engineer_name = $2, notes = $3 WHERE id = $4 RETURNING *',
      [document_url, engineer_name, notes, id]
    );
    return updated.rows[0];
  },
  async delete(id, user) {
    // Solo jefe laboratorio puede eliminar
    await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    return true;
  },
};

module.exports = Quote;
