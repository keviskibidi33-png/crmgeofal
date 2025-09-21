const pool = require('../config/db');

const Subservice = {
  async getAllByService(service_id, { q, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const clauses = ['service_id = $1'];
    const params = [service_id];
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      clauses.push(`LOWER(name) LIKE $${params.length}`);
    }
    const where = `WHERE ${clauses.join(' AND ')}`;
    const data = await pool.query(
      `SELECT * FROM subservices ${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*) FROM subservices ${where}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ service_id, name }) {
    const res = await pool.query('INSERT INTO subservices (service_id, name) VALUES ($1, $2) RETURNING *', [service_id, name]);
    return res.rows[0];
  },
  async update(id, { name }) {
    const res = await pool.query('UPDATE subservices SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    return res.rows[0];
  },
  async remove(id) {
    const res = await pool.query('DELETE FROM subservices WHERE id = $1', [id]);
    return res.rowCount > 0;
  }
};

module.exports = Subservice;
