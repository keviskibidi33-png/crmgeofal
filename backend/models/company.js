const pool = require('../config/db');

const Company = {
  async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM companies ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM companies');
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    return res.rows[0];
  },
  async getByRuc(ruc) {
    const res = await pool.query('SELECT * FROM companies WHERE ruc = $1', [ruc]);
    return res.rows[0];
  },
  async create({ ruc, name, address }) {
    const res = await pool.query(
      'INSERT INTO companies (ruc, name, address) VALUES ($1, $2, $3) RETURNING *',
      [ruc, name, address]
    );
    return res.rows[0];
  },
  async update(id, { name, address }) {
    const res = await pool.query(
      'UPDATE companies SET name = $1, address = $2 WHERE id = $3 RETURNING *',
      [name, address, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    return true;
  },
};

module.exports = Company;
