
const pool = require('../config/db');

const Quote = {
  async getAll({ project_id, company_id, status, page = 1, limit = 20, date_from, date_to }) {
    let where = [];
    let params = [];
    if (project_id) { where.push('q.project_id = $' + (params.length + 1)); params.push(project_id); }
    if (company_id) { where.push('p.company_id = $' + (params.length + 1)); params.push(company_id); }
    if (status) { where.push('q.status = $' + (params.length + 1)); params.push(status); }
    if (date_from) { where.push('q.issue_date >= $' + (params.length + 1)); params.push(date_from); }
    if (date_to) { where.push('q.issue_date <= $' + (params.length + 1)); params.push(date_to); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (page - 1) * limit;
    
    const select = `
      SELECT 
        q.*,
        p.name as project_name,
        p.location as project_location,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as created_by_name,
        u.role as created_by_role
      FROM quotes q 
      LEFT JOIN projects p ON p.id = q.project_id 
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause} 
      ORDER BY q.created_at DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const count = `SELECT COUNT(*) FROM quotes q LEFT JOIN projects p ON p.id = q.project_id ${whereClause}`;
    const data = await pool.query(select, [...params, limit, offset]);
    const total = await pool.query(count, params);
    return { quotes: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query(`
      SELECT 
        q.*,
        p.name as project_name,
        p.location as project_location,
        c.name as company_name,
        c.ruc as company_ruc,
        u.name as created_by_name,
        u.role as created_by_role
      FROM quotes q 
      LEFT JOIN projects p ON p.id = q.project_id 
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [id]);
    return res.rows[0];
  },
  async create({ project_id, variant_id, created_by, client_contact, client_email, client_phone, issue_date, subtotal = 0, igv = 0, total, status, reference = null, reference_type = null, meta = null }) {
    const res = await pool.query(
      'INSERT INTO quotes (project_id, variant_id, created_by, client_contact, client_email, client_phone, issue_date, subtotal, igv, total, status, reference, reference_type, meta) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *',
      [project_id, variant_id, created_by, client_contact, client_email, client_phone, issue_date, subtotal, igv, total, status, reference, reference_type, meta]
    );
    return res.rows[0];
  },
  async update(id, { client_contact, client_email, client_phone, issue_date, subtotal = 0, igv = 0, total, status, reference = null, reference_type = null, meta = null }) {
    const res = await pool.query(
      'UPDATE quotes SET client_contact=$1, client_email=$2, client_phone=$3, issue_date=$4, subtotal=$5, igv=$6, total=$7, status=$8, reference=$9, reference_type=$10, meta=$11, updated_at=NOW() WHERE id=$12 RETURNING *',
      [client_contact, client_email, client_phone, issue_date, subtotal, igv, total, status, reference, reference_type, meta, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    return true;
  }
};

module.exports = Quote;
