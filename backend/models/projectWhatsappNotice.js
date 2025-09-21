const pool = require('../config/db');

const ProjectWhatsappNotice = {
  async getAllByProject(project_id) {
    const res = await pool.query('SELECT * FROM project_whatsapp_notices WHERE project_id = $1 ORDER BY sent_at DESC', [project_id]);
    return res.rows;
  },
  async getAll({ page = 1, limit = 20, q = '', status = '', project_id = '', range = '30' }) {
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];
    if (q) { params.push(`%${q.toLowerCase()}%`); conds.push('(LOWER(message) LIKE $' + params.length + ' OR LOWER(sent_to) LIKE $' + params.length + ')'); }
    if (project_id) { params.push(project_id); conds.push('project_id = $' + params.length); }
    if (status) { params.push(status); conds.push('status = $' + params.length); }
    if (range && range !== 'all') { const days = Number(range)||30; params.push(days); conds.push(`sent_at >= NOW() - ($${params.length}::int || ' days')::interval`); }
    const where = conds.length ? ('WHERE ' + conds.join(' AND ')) : '';
    const data = await pool.query(`SELECT * FROM project_whatsapp_notices ${where} ORDER BY id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
    const total = await pool.query(`SELECT COUNT(*) FROM project_whatsapp_notices ${where}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async create({ project_id, sent_by, sent_to, message }) {
    const res = await pool.query(
      `INSERT INTO project_whatsapp_notices (project_id, sent_by, sent_to, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [project_id, sent_by, sent_to, message]
    );
    return res.rows[0];
  }
};

module.exports = ProjectWhatsappNotice;
