const pool = require('../config/db');

const Ticket = {
  async getAll({ page = 1, limit = 20, status, priority }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    if (status) { where.push('status = $' + (params.length + 1)); params.push(status); }
    if (priority) { where.push('priority = $' + (params.length + 1)); params.push(priority); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const data = await pool.query(`SELECT * FROM tickets ${whereClause} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
    const total = await pool.query(`SELECT COUNT(*) FROM tickets ${whereClause}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create({ 
    user_id, 
    title, 
    description, 
    priority, 
    module,
    category,
    type,
    assigned_to,
    estimated_time,
    tags,
    additional_notes,
    attachment_url 
  }) {
    const res = await pool.query(
      'INSERT INTO tickets (user_id, title, description, priority, module, category, type, assigned_to, estimated_time, tags, additional_notes, attachment_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [user_id, title, description, priority, module, category, type, assigned_to, estimated_time, tags, additional_notes, attachment_url]
    );
    return res.rows[0];
  },
  async updateStatus(id, status) {
    const res = await pool.query('UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
    return res.rows[0];
  }
};

module.exports = Ticket;
