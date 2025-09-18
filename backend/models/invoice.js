const pool = require('../config/db');

const Invoice = {
  async getAll({ page = 1, limit = 20, payment_status }) {
    const offset = (page - 1) * limit;
    let where = payment_status ? 'WHERE payment_status = $1' : '';
    let params = payment_status ? [payment_status, limit, offset] : [limit, offset];
    const data = await pool.query(`SELECT * FROM invoices ${where} ORDER BY id DESC LIMIT $${where ? 2 : 1} OFFSET $${where ? 3 : 2}`, params);
    const total = await pool.query(`SELECT COUNT(*) FROM invoices ${where}`, payment_status ? [payment_status] : []);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create({ project_id, quote_number, received_at, payment_due, payment_status, amount, created_by }) {
    const res = await pool.query(
      'INSERT INTO invoices (project_id, quote_number, received_at, payment_due, payment_status, amount, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [project_id, quote_number, received_at, payment_due, payment_status, amount, created_by]
    );
    return res.rows[0];
  },
  async updateStatus(id, payment_status) {
    const res = await pool.query('UPDATE invoices SET payment_status = $1 WHERE id = $2 RETURNING *', [payment_status, id]);
    return res.rows[0];
  }
};

module.exports = Invoice;
