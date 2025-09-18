const pool = require('../config/db');

const Lead = {
  async getAll({ page = 1, limit = 20, status, type }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    if (status) { where.push('status = $' + (params.length + 1)); params.push(status); }
    if (type) { where.push('type = $' + (params.length + 1)); params.push(type); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const data = await pool.query(`SELECT * FROM leads ${whereClause} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
    const total = await pool.query(`SELECT COUNT(*) FROM leads ${whereClause}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create({ company_id, name, email, phone, status, type, assigned_to }) {
    const res = await pool.query(
      'INSERT INTO leads (company_id, name, email, phone, status, type, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [company_id, name, email, phone, status, type, assigned_to]
    );
    return res.rows[0];
  },
  async updateStatus(id, status) {
    const res = await pool.query('UPDATE leads SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return res.rows[0];
  }
};

module.exports = Lead;
