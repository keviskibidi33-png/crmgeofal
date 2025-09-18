const pool = require('../config/db');

const Evidence = {
  async getAll({ project_id, invoice_id, type, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    if (project_id) { where.push('project_id = $' + (params.length + 1)); params.push(project_id); }
    if (invoice_id) { where.push('invoice_id = $' + (params.length + 1)); params.push(invoice_id); }
    if (type) { where.push('type = $' + (params.length + 1)); params.push(type); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const data = await pool.query(`SELECT * FROM evidences ${whereClause} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
    const total = await pool.query(`SELECT COUNT(*) FROM evidences ${whereClause}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ project_id, invoice_id, type, file_url, uploaded_by }) {
    const res = await pool.query(
      'INSERT INTO evidences (project_id, invoice_id, type, file_url, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [project_id, invoice_id, type, file_url, uploaded_by]
    );
    return res.rows[0];
  }
};

module.exports = Evidence;
