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
  async create({ type, ruc, dni, name, address, email, phone, contact_name }) {
    const res = await pool.query(
      `INSERT INTO companies (type, ruc, dni, name, address, email, phone, contact_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [type, ruc, dni, name, address, email, phone, contact_name]
    );
    return res.rows[0];
  },
  async update(id, { type, ruc, dni, name, address, email, phone, contact_name }) {
    const res = await pool.query(
      `UPDATE companies SET type = $1, ruc = $2, dni = $3, name = $4, address = $5, email = $6, phone = $7, contact_name = $8 WHERE id = $9 RETURNING *`,
      [type, ruc, dni, name, address, email, phone, contact_name, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    return true;
  },
};

module.exports = Company;
