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
};

module.exports = Service;
