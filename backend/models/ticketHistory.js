const pool = require('../config/db');

const TicketHistory = {
  async getByTicket(ticket_id, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const data = await pool.query('SELECT * FROM ticket_history WHERE ticket_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [ticket_id, limit, offset]);
    const total = await pool.query('SELECT COUNT(*) FROM ticket_history WHERE ticket_id = $1', [ticket_id]);
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async add({ ticket_id, action, performed_by, notes }) {
    const res = await pool.query(
      'INSERT INTO ticket_history (ticket_id, action, performed_by, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [ticket_id, action, performed_by, notes]
    );
    return res.rows[0];
  }
};

module.exports = TicketHistory;
