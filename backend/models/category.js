const pool = require('../config/db');

const Category = {
  async getAll({ q, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      where = `WHERE LOWER(name) LIKE $${params.length}`;
    }
    const data = await pool.query(`SELECT * FROM categories ${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
    const total = await pool.query(`SELECT COUNT(*) FROM categories ${where}`, params);
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
