const pool = require('../config/db');

const AuditQuote = {
  async log({ user_id, action, entity, entity_id, details }) {
    await pool.query(
      'INSERT INTO audit_quotes (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [user_id, action, entity, entity_id, details]
    );
  },
  async create({ quote_id, action, old_values, new_values, user_id, user_name, user_role }) {
    await pool.query(
      'INSERT INTO audit_quotes (user_id, action, entity, entity_id, details, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [user_id, action, 'quote', quote_id, JSON.stringify({ old_values, new_values, user_name, user_role })]
    );
  },
  async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM audit_quotes ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM audit_quotes');
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  }
};

module.exports = AuditQuote;
