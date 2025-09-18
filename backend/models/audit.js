const pool = require('../config/db');

const Audit = {
  async log({ user_id, action, entity, entity_id, details }) {
    await pool.query(
      'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [user_id, action, entity, entity_id, details]
    );
  },
  async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM audit_log ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM audit_log');
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  }
};

module.exports = Audit;
