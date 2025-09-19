
const pool = require('../config/db');

const Quote = {
  async getAll({ project_id, status, page = 1, limit = 20 }) {
    let where = [];
    let params = [];
    if (project_id) { where.push('project_id = $' + (params.length + 1)); params.push(project_id); }
    if (status) { where.push('status = $' + (params.length + 1)); params.push(status); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (page - 1) * limit;
    const data = await pool.query(
      `SELECT * FROM quotes ${whereClause} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*) FROM quotes ${whereClause}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create({ project_id, variant_id, created_by, client_contact, client_email, client_phone, issue_date, total, status }) {
    const res = await pool.query(
      'INSERT INTO quotes (project_id, variant_id, created_by, client_contact, client_email, client_phone, issue_date, total, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [project_id, variant_id, created_by, client_contact, client_email, client_phone, issue_date, total, status]
    );
    return res.rows[0];
  },
  async update(id, { client_contact, client_email, client_phone, issue_date, total, status }) {
    const res = await pool.query(
      'UPDATE quotes SET client_contact=$1, client_email=$2, client_phone=$3, issue_date=$4, total=$5, status=$6 WHERE id=$7 RETURNING *',
      [client_contact, client_email, client_phone, issue_date, total, status, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    return true;
  }
};

module.exports = Quote;
