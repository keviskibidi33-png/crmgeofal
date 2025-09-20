const pool = require('../config/db');

const ExportHistory = {
  async log({ user_id, type, resource }) {
    await pool.query(
      'INSERT INTO export_history (user_id, type, resource) VALUES ($1, $2, $3)',
      [user_id, type, resource]
    );
  },
  async getAll({ page = 1, limit = 20, q = '', type = '', range = '30' }) {
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      conds.push('(LOWER(resource) LIKE $' + params.length + ')');
    }
    if (type) {
      params.push(type);
      conds.push('type = $' + params.length);
    }
    if (range && range !== 'all') {
      const days = Number(range) || 30;
      params.push(days);
      conds.push(`created_at >= NOW() - ($${params.length}::int || ' days')::interval`);
    }
    const where = conds.length ? ('WHERE ' + conds.join(' AND ')) : '';
    const data = await pool.query(
      `SELECT eh.*, u.name as user_name
       FROM export_history eh
       LEFT JOIN users u ON u.id = eh.user_id
       ${where}
       ORDER BY eh.id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*) FROM export_history eh ${where}`, params);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  }
};

module.exports = ExportHistory;
