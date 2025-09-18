const pool = require('../config/db');

const Category = {
  async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM categories ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM categories');
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ name }) {
    const res = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    return res.rows[0];
  },
  async update(id, { name }) {
    const res = await pool.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return true;
  },
};

module.exports = Category;
