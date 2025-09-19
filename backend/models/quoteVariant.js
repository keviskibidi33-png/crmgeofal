const pool = require('../config/db');

const QuoteVariant = {
  async getAll({ active = true } = {}) {
    const res = await pool.query('SELECT * FROM quote_variants WHERE active = $1 ORDER BY id', [active]);
    return res.rows;
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM quote_variants WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create({ code, title, description, conditions }) {
    const res = await pool.query(
      'INSERT INTO quote_variants (code, title, description, conditions) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, title, description, conditions]
    );
    return res.rows[0];
  },
  async update(id, { title, description, conditions, active }) {
    const res = await pool.query(
      'UPDATE quote_variants SET title = $1, description = $2, conditions = $3, active = $4 WHERE id = $5 RETURNING *',
      [title, description, conditions, active, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM quote_variants WHERE id = $1', [id]);
    return true;
  }
};

module.exports = QuoteVariant;
