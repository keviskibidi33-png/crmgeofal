const pool = require('../config/db');

const QuoteItem = {
  async getAllByQuote(quote_id) {
    const res = await pool.query('SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY id', [quote_id]);
    return res.rows;
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM quote_items WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create({ quote_id, code, description, norm, unit_price, quantity, partial_price }) {
    const res = await pool.query(
      'INSERT INTO quote_items (quote_id, code, description, norm, unit_price, quantity, partial_price) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [quote_id, code, description, norm, unit_price, quantity, partial_price]
    );
    return res.rows[0];
  },
  async update(id, { code, description, norm, unit_price, quantity, partial_price }) {
    const res = await pool.query(
      'UPDATE quote_items SET code=$1, description=$2, norm=$3, unit_price=$4, quantity=$5, partial_price=$6 WHERE id=$7 RETURNING *',
      [code, description, norm, unit_price, quantity, partial_price, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM quote_items WHERE id = $1', [id]);
    return true;
  }
};

module.exports = QuoteItem;
