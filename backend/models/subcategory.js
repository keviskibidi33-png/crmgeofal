const pool = require('../config/db');

const Subcategory = {
  async getAllByCategory(category_id, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM subcategories WHERE category_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [category_id, limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM subcategories WHERE category_id = $1', [category_id]);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ category_id, name }) {
    const res = await pool.query('INSERT INTO subcategories (category_id, name) VALUES ($1, $2) RETURNING *', [category_id, name]);
    return res.rows[0];
  },
  async update(id, { name }) {
    const res = await pool.query('UPDATE subcategories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM subcategories WHERE id = $1', [id]);
    return true;
  },
};

module.exports = Subcategory;
