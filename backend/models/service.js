const pool = require('../config/db');

const Service = {
  async getAll({ area, q, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const clauses = [];
    const params = [];
    if (area) {
      params.push(area);
      clauses.push(`area = $${params.length}`);
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      clauses.push(`LOWER(name) LIKE $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const data = await pool.query(
      `SELECT * FROM services ${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*) FROM services ${where}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ name, area }) {
    const res = await pool.query('INSERT INTO services (name, area) VALUES ($1, $2) RETURNING *', [name, area]);
    return res.rows[0];
  },
  async update(id, { name, area }) {
    const res = await pool.query('UPDATE services SET name = $1, area = $2 WHERE id = $3 RETURNING *', [name, area, id]);
    return res.rows[0];
  },
  async remove(id) {
    const res = await pool.query('DELETE FROM services WHERE id = $1', [id]);
    return res.rowCount > 0;
  }
};

module.exports = Service;
