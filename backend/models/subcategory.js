const pool = require('../config/db');

const Subcategory = {
  async getAllByCategory(category_id, { q, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const clauses = ['category_id = $1'];
    const params = [category_id];
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      clauses.push(`LOWER(name) LIKE $${params.length}`);
    }
    const where = `WHERE ${clauses.join(' AND ')}`;
    const data = await pool.query(
      `SELECT * FROM subcategories ${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*) FROM subcategories ${where}`, params);
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
